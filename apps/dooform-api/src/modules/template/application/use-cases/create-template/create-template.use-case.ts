import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Template } from '../../../domain/entities/template.entity'
import { TemplateVisibility } from '../../../domain/enums/template.enum'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { IPlaceholderExtractorService } from '../../../domain/services/placeholder-extractor.service'
import type { IFieldDefinitionGeneratorService } from '../../../domain/services/field-definition-generator.service'
import type { ITemplatePreviewService } from '../../../domain/services/template-preview.service'
import { CreateTemplateDto } from '../../dtos/create-template.dto'
import { OrgPath } from '../../../../../common/storage/org-path'
import { StorageQuotaService } from '../../../../user/application/services/storage-quota.service'

/**
 * Best-effort serialization of an unknown caught error so a log line carries
 * usable diagnostic info even when the thrown value isn't a stock Error
 * (e.g. AxiosError surfaces extra `code`, `response.status`, etc.).
 */
function describeError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as {
      message?: unknown
      code?: unknown
      name?: unknown
      response?: { status?: unknown; statusText?: unknown }
    }
    const parts = [
      e.name ? `name=${String(e.name)}` : null,
      e.message ? `message=${String(e.message)}` : null,
      e.code ? `code=${String(e.code)}` : null,
      e.response?.status ? `status=${String(e.response.status)}` : null,
      e.response?.statusText ? `statusText=${String(e.response.statusText)}` : null,
    ].filter(Boolean)
    if (parts.length > 0) return parts.join(' | ')
  }
  return String(err)
}

interface CreateTemplateResult {
  id: string
  name: string
  description?: string | null
  status: string
  type: string
  tier: string
  filePath?: string | null
  originalFilename?: string | null
  createdAt: Date
}

@Injectable()
@UseClassLogger('template')
export class CreateTemplateUseCase implements UseCase<CreateTemplateDto, CreateTemplateResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IPlaceholderExtractorService')
    private readonly placeholderExtractor: IPlaceholderExtractorService,
    @Inject('IFieldDefinitionGeneratorService')
    private readonly fieldDefinitionGenerator: IFieldDefinitionGeneratorService,
    @Inject('ITemplatePreviewService')
    private readonly previewService: ITemplatePreviewService,
    private readonly quota: StorageQuotaService,
  ) {}

  @UseResult()
  @ValidateInput(CreateTemplateDto)
  async execute(
    dto: CreateTemplateDto,
    templateFile?: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<CreateTemplateResult>> {
    // Visibility / tier guarding: only GLOBAL_ADMIN may publish a template across orgs.
    // For everyone else, force ORGANIZATION visibility regardless of what the body asked.
    const isGlobalAdmin = dto.callerRole === 'GLOBAL_ADMIN'
    const visibility = isGlobalAdmin
      ? dto.visibility ?? TemplateVisibility.ORGANIZATION
      : TemplateVisibility.ORGANIZATION

    if (!isGlobalAdmin && !dto.organizationId) {
      throw new Error('organizationId is required to upload a template')
    }
    // Org-scoped uploads bind to the caller's org. GLOBAL templates may have organizationId=null.
    const orgId = visibility === TemplateVisibility.GLOBAL ? null : dto.organizationId
    // Storage prefix: org-scoped for tenant uploads, a `global/` namespace for platform-wide ones.
    const storagePrefix = (segments: string[]) =>
      orgId ? OrgPath.for(orgId, ...segments) : `global/${segments.join('/')}`

    // type / tier / category are configurable codes (string at the API boundary).
    // The entity types still reference the legacy enums, so cast through unknown.
    const template = Template.create({
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      author: dto.author,
      type: dto.type as unknown as never,
      tier: (dto.tier ? String(dto.tier).toLowerCase() : dto.tier) as unknown as never,
      category: dto.category as unknown as never,
      pageOrientation: dto.pageOrientation,
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? null,
      visibility,
    })

    // Save the DOCX file to storage if provided
    if (templateFile) {
      // Quota only applies to org-scoped uploads — global templates aren't billed to a tenant.
      if (orgId) {
        await this.quota.assertCanWrite(orgId, templateFile.size)
      }
      const filePath = storagePrefix(['templates', template.id, 'template.docx'])
      await this.storageService.save(filePath, templateFile.buffer)
      if (orgId) {
        await this.quota.recordWrite(orgId, templateFile.size)
      }
      template.setFilePath(filePath, templateFile.originalname)
      template.setFileSize(templateFile.size)
      template.setMimeType(templateFile.mimetype)

      // Extract placeholders and generate field definitions
      try {
        const placeholders = await this.placeholderExtractor.extractPlaceholders(templateFile.buffer)
        template.setPlaceholders(placeholders)

        const fieldDefs = this.fieldDefinitionGenerator.generateFromPlaceholders(placeholders)
        template.setFieldDefinitions(fieldDefs)
      } catch (err) {
        new Logger('CreateTemplateUseCase').warn('Failed to extract placeholders from DOCX, continuing without')
      }

      // Generate previews (non-fatal)
      try {
        const pdfBuffer = await this.previewService.generatePdfPreview(templateFile.buffer)
        const pdfPath = storagePrefix(['templates', template.id, 'preview.pdf'])
        await this.storageService.save(pdfPath, pdfBuffer)
        template.setFilePathPDF(pdfPath)

        // Generate thumbnails from PDF — HD (default) for detail views and SM
        // (low-res, ~400px) for compact list previews on the dashboard. Run
        // sequentially because the LibreOffice service is single-threaded under
        // load and parallel calls have caused timeouts in the past.
        try {
          const thumbnailBuffer = await this.previewService.generateThumbnail(pdfBuffer)
          const thumbnailPath = storagePrefix(['templates', template.id, 'thumbnail.png'])
          await this.storageService.save(thumbnailPath, thumbnailBuffer)
          template.setFilePathThumbnail(thumbnailPath)
        } catch (err) {
          new Logger('CreateTemplateUseCase').warn(
            `Failed to generate HD thumbnail, continuing without: ${describeError(err)}`,
          )
        }
        try {
          const smBuffer = await this.previewService.generateThumbnail(pdfBuffer, {
            quality: 'normal',
            width: 480,
          })
          const smPath = storagePrefix(['templates', template.id, 'thumbnail-sm.png'])
          await this.storageService.save(smPath, smBuffer)
          template.setFilePathThumbnailSm(smPath)
        } catch (err) {
          new Logger('CreateTemplateUseCase').warn(
            `Failed to generate small thumbnail, continuing without: ${describeError(err)}`,
          )
        }
      } catch (err) {
        new Logger('CreateTemplateUseCase').warn(
          `Failed to generate PDF preview, continuing without: ${describeError(err)}`,
        )
      }

      try {
        const htmlBuffer = await this.previewService.generateHtmlPreview(templateFile.buffer)
        const htmlPath = storagePrefix(['templates', template.id, 'preview.html'])
        await this.storageService.save(htmlPath, htmlBuffer)
        template.setFilePathHTML(htmlPath)
      } catch (err) {
        new Logger('CreateTemplateUseCase').warn(
          `Failed to generate HTML preview, continuing without: ${describeError(err)}`,
        )
      }
    }

    const saved = await this.templateRepository.save(template)
    const props = saved.getProps()

    return {
      id: saved.id,
      name: props.name,
      description: props.description,
      status: props.status,
      type: props.type,
      tier: props.tier,
      filePath: props.filePath,
      originalFilename: props.originalFilename,
      createdAt: props.createdAt!,
    } as any
  }
}
