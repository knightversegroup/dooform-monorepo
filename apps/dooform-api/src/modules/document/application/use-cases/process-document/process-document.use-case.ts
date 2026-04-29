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
import { PdfLibManipulatorService } from '../../../infrastructure/services/pdf-lib-manipulator.service'
import { ProcessDocumentDto } from '../../dtos/process-document.dto'

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
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('ITemplateProcessorService')
    private readonly templateProcessor: ITemplateProcessorService,
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
    @Inject('ISystemConfigRepository')
    private readonly systemConfigRepository: ISystemConfigRepository,
    private readonly pdfManipulator: PdfLibManipulatorService,
  ) {}

  @UseResult()
  @ValidateInput(ProcessDocumentDto)
  async execute(
    dto: ProcessDocumentDto,
    templateFile?: { buffer: Buffer; originalname: string; mimetype: string; size: number },
  ): Promise<Result<ProcessDocumentResult>> {
    const { templateId, data, userId, userTier } = dto

    // 1. Get template DOCX: use uploaded file, or read from storage
    let templateBuffer: Buffer
    if (templateFile) {
      templateBuffer = templateFile.buffer
      // Save uploaded template for future regeneration
      const templateStoragePath = `templates/${templateId}/template.docx`
      await this.storageService.save(templateStoragePath, templateBuffer)
    } else {
      const templateStoragePath = `templates/${templateId}/template.docx`
      templateBuffer = await this.storageService.read(templateStoragePath)
    }

    // 2. Process template with docxtemplater
    const processedDocx = await this.templateProcessor.processTemplate(templateBuffer, data)

    // 3. Create document entity
    const filename = `document_${Date.now()}.docx`
    const document = Document.create({
      templateId,
      userId,
      filename,
      data,
    })

    // 4. Save processed DOCX to storage
    const docxPath = `documents/${document.id}/${filename}`
    await this.storageService.save(docxPath, processedDocx)
    document.setFilePathDocx(docxPath)
    document.setFileSize(processedDocx.length)
    document.setMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    // 5. Convert to PDF via LibreOffice
    try {
      const isAvailable = await this.pdfConverter.isAvailable()
      if (isAvailable) {
        let pdfBuffer = await this.pdfConverter.convertDocxToPdf(processedDocx)

        // 6. Apply branding watermark for free-tier users
        if (userTier === UserTier.FREE) {
          pdfBuffer = await this.applyBrandingWatermark(pdfBuffer)
        }

        const pdfFilename = filename.replace('.docx', '.pdf')
        const pdfPath = `documents/${document.id}/${pdfFilename}`
        await this.storageService.save(pdfPath, pdfBuffer)
        document.setFilePathPdf(pdfPath)
      } else {
        new Logger('ProcessDocumentUseCase').warn('LibreOffice service unavailable, skipping PDF conversion')
      }
    } catch (err) {
      new Logger('ProcessDocumentUseCase').error('PDF conversion failed, continuing without PDF', err instanceof Error ? err : undefined)
    }

    // 7. Mark completed and save
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
