import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Document } from '../../../domain/entities/document.entity'
import { UserTier } from '../../../domain/enums/document.enum'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { ISystemConfigRepository } from '../../../domain/repositories/system-config.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import type { ITemplateProcessorService } from '../../../domain/services/template-processor.service'
import type { IPdfConverterService } from '../../../domain/services/pdf-converter.service'
import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import type { ITemplateRepository } from '../../../../template/domain/repositories/template.repository'
import { PdfLibManipulatorService } from '../../../infrastructure/services/pdf-lib-manipulator.service'
import { ProcessDocumentDto } from '../../dtos/process-document.dto'
import { OrgPath } from '../../../../../common/storage/org-path'
import { StorageQuotaService } from '../../../../user/application/services/storage-quota.service'
import { TierConfigService } from '../../../../user/application/services/tier-config.service'
import { TierService } from '../../../../user/application/services/tier.service'

const BRANDING_WATERMARK_KEY = 'branding_watermark'

const DEFAULT_BRANDING_TEXT = 'DOOFORM'

interface ProcessDocumentResult {
  id: string
  filename: string
  filePathDocx: string | null | undefined
  filePathPdf: string | null | undefined
  status: string
  createdAt: Date
}

@Injectable()
@UseClassLogger('document')
export class ProcessDocumentUseCase implements UseCase<ProcessDocumentDto, ProcessDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('ITemplateProcessorService')
    private readonly templateProcessor: ITemplateProcessorService,
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
    @Inject('ISystemConfigRepository')
    private readonly systemConfigRepository: ISystemConfigRepository,
    private readonly pdfManipulator: PdfLibManipulatorService,
    private readonly quota: StorageQuotaService,
    private readonly tierConfig: TierConfigService,
    private readonly tierService: TierService,
  ) {}

  @UseResult()
  @ValidateInput(ProcessDocumentDto)
  async execute(
    dto: ProcessDocumentDto,
    templateFile?: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<ProcessDocumentResult>> {
    const { templateId, data, userId, organizationId } = dto
    const customFilename = dto.filename?.trim()
    if (!organizationId) {
      throw new Error('organizationId is required to process documents')
    }

    // 1. Fetch template record to get the actual stored file path
    const template = await this.templateRepository.findById(templateId)
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`)
    }

    // 2. Get template DOCX: use uploaded file, or read from storage using the stored path
    let templateBuffer: Buffer
    const orgTemplateKey = OrgPath.for(organizationId, 'templates', templateId, 'template.docx')
    if (templateFile) {
      templateBuffer = templateFile.buffer
      await this.storageService.save(orgTemplateKey, templateBuffer)
    } else if (template.filePath && await this.storageService.exists(template.filePath)) {
      // Primary: use the actual stored path from the template record
      templateBuffer = await this.storageService.read(template.filePath)
    } else if (await this.storageService.exists(orgTemplateKey)) {
      // Fallback: org-scoped path
      templateBuffer = await this.storageService.read(orgTemplateKey)
    } else {
      // Legacy fallback: pre-multi-tenancy templates were stored without an org prefix
      const legacyTemplateKey = `templates/${templateId}/template.docx`
      templateBuffer = await this.storageService.read(legacyTemplateKey)
    }

    // 3. Process template with docxtemplater
    const processedDocx = await this.templateProcessor.processTemplate(templateBuffer, data)

    // 4. Create document entity. If the caller passed a custom filename, sanitize it
    //    (no path separators, ensure .docx extension); otherwise fall back to a
    //    timestamped default.
    const filename = customFilename
      ? sanitizeFilename(customFilename)
      : `document_${Date.now()}.docx`
    const document = Document.create({
      templateId,
      userId,
      filename,
      data,
      organizationId,
    })

    // 5. Quota-check + save processed DOCX to org-scoped storage
    await this.quota.assertCanWrite(organizationId, processedDocx.length)
    const docxPath = OrgPath.for(organizationId, 'documents', document.id, filename)
    await this.storageService.save(docxPath, processedDocx)
    await this.quota.recordWrite(organizationId, processedDocx.length)
    document.setFilePathDocx(docxPath)
    document.setFileSize(processedDocx.length)
    document.setMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    // 6. Convert to PDF via LibreOffice
    try {
      const isAvailable = await this.pdfConverter.isAvailable()
      if (isAvailable) {
        let pdfBuffer = await this.pdfConverter.convertDocxToPdf(processedDocx)

        // 7. Apply branding watermark unless the org's tier includes the
        // remove_watermark capability. Resolved server-side from the org's
        // tier_configs row + any per-tier overrides. Falls back to "stamp on"
        // when the org has no recognised tier.
        const canRemoveWatermark = await this.tierService.hasCapability(
          organizationId,
          'feature:remove_watermark',
        )
        if (!canRemoveWatermark) {
          pdfBuffer = await this.applyBrandingWatermark(pdfBuffer)
        }

        const pdfFilename = filename.replace('.docx', '.pdf')
        const pdfPath = OrgPath.for(organizationId, 'documents', document.id, pdfFilename)
        await this.quota.assertCanWrite(organizationId, pdfBuffer.length)
        await this.storageService.save(pdfPath, pdfBuffer)
        await this.quota.recordWrite(organizationId, pdfBuffer.length)
        document.setFilePathPdf(pdfPath)
      } else {
        new Logger('ProcessDocumentUseCase').warn('LibreOffice service unavailable, skipping PDF conversion')
      }
    } catch (err) {
      new Logger('ProcessDocumentUseCase').error('PDF conversion failed, continuing without PDF', err instanceof Error ? err : undefined)
    }

    // 8. Mark completed and save
    document.markCompleted()
    const saved = await this.documentRepository.save(document)
    const props = saved.getProps()

    return {
      id: saved.id,
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf,
      status: props.status,
      createdAt: props.createdAt!,
    } as any
  }

  private async applyBrandingWatermark(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const brandingConfig = await this.systemConfigRepository.findByKey(BRANDING_WATERMARK_KEY)

      if (brandingConfig) {
        const config = brandingConfig.value as WatermarkConfig
        return this.pdfManipulator.applyWatermark(pdfBuffer, config)
      }

      // Default: 3x3 grid branding
      return this.pdfManipulator.applyBrandingWatermark(pdfBuffer, DEFAULT_BRANDING_TEXT)
    } catch (err) {
      new Logger('ProcessDocumentUseCase').warn('Failed to apply branding watermark, continuing without')
      return pdfBuffer
    }
  }
}

/**
 * Make a user-supplied filename safe for storage paths and download headers:
 * strip directory separators and characters that would break Content-Disposition,
 * and guarantee a `.docx` extension.
 */
function sanitizeFilename(input: string): string {
  let name = input.replace(/[\\/]/g, '_').replace(/[\x00-\x1f"<>|*?]/g, '')
  name = name.trim()
  if (!name) name = `document_${Date.now()}`
  if (!/\.docx$/i.test(name)) name = `${name}.docx`
  if (name.length > 255) name = name.slice(0, 250) + '.docx'
  return name
}
