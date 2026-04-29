import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Template } from '../../../domain/entities/template.entity'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { IPlaceholderExtractorService } from '../../../domain/services/placeholder-extractor.service'
import type { IFieldDefinitionGeneratorService } from '../../../domain/services/field-definition-generator.service'
import type { ITemplatePreviewService } from '../../../domain/services/template-preview.service'
import { CreateTemplateDto } from '../../dtos/create-template.dto'

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
  ) {}

  @UseResult()
  @ValidateInput(CreateTemplateDto)
  async execute(
    dto: CreateTemplateDto,
    templateFile?: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<CreateTemplateResult>> {
    const template = Template.create({
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      author: dto.author,
      type: dto.type,
      tier: dto.tier,
      category: dto.category,
      pageOrientation: dto.pageOrientation,
    })

    // Save the DOCX file to storage if provided
    if (templateFile) {
      const filePath = `templates/${template.id}/template.docx`
      await this.storageService.save(filePath, templateFile.buffer)
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
        const pdfPath = `templates/${template.id}/preview.pdf`
        await this.storageService.save(pdfPath, pdfBuffer)
        template.setFilePathPDF(pdfPath)

        // Generate thumbnail from PDF
        try {
          const thumbnailBuffer = await this.previewService.generateThumbnail(pdfBuffer)
          const thumbnailPath = `templates/${template.id}/thumbnail.png`
          await this.storageService.save(thumbnailPath, thumbnailBuffer)
          template.setFilePathThumbnail(thumbnailPath)
        } catch {
          new Logger('CreateTemplateUseCase').warn('Failed to generate thumbnail, continuing without')
        }
      } catch {
        new Logger('CreateTemplateUseCase').warn('Failed to generate PDF preview, continuing without')
      }

      try {
        const htmlBuffer = await this.previewService.generateHtmlPreview(templateFile.buffer)
        const htmlPath = `templates/${template.id}/preview.html`
        await this.storageService.save(htmlPath, htmlBuffer)
        template.setFilePathHTML(htmlPath)
      } catch {
        new Logger('CreateTemplateUseCase').warn('Failed to generate HTML preview, continuing without')
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
