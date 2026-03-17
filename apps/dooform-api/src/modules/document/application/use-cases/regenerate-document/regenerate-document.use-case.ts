import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../../template/domain/repositories/template.repository'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { RegenerateDocumentDto } from '../../dtos/regenerate-document.dto'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { ConversionService } from '../../services/conversion.service'
import { StorageService } from '../../services/storage.service'

interface RegenerateDocumentResult {
  message: string
  documentId: string
  downloadUrl: string
  downloadPdfUrl: string
  document: {
    id: string
    templateId: string
    userId: string
    filename: string
    filePathDocx: string
    filePathPdf: string
    fileSize: number
    mimeType: string
    status: string
    createdAt: Date
    updatedAt: Date
  }
}

@Injectable()
@UseClassLogger('document')
export class RegenerateDocumentUseCase implements UseCase<RegenerateDocumentDto, RegenerateDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly docxProcessor: DocxProcessorService,
    private readonly conversionService: ConversionService,
    private readonly storageService: StorageService,
  ) {}

  @UseResult()
  @ValidateInput(RegenerateDocumentDto)
  async execute(dto: RegenerateDocumentDto): Promise<Result<RegenerateDocumentResult>> {
    const document = await this.documentRepository.findById(dto.id)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }

    const docProps = document.getProps()

    // Authorization check
    if (docProps.userId !== dto.userId) {
      throw new UnauthorizedAccessException("You don't have access to this document")
    }

    // Parse stored data
    let data: Record<string, string>
    try {
      data = docProps.data ? JSON.parse(docProps.data) : {}
    } catch {
      data = {}
    }

    // Get template
    const template = await this.templateRepository.findById(docProps.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${docProps.templateId} not found`)
    }

    const templateProps = template.getProps()

    // Download template DOCX from storage
    const templateBuffer = await this.storageService.readFile((templateProps as any).filePathDocx ?? '')

    // Process DOCX: replace placeholders with actual data
    const processedBuffer = await this.docxProcessor.process(templateBuffer, data)

    // Upload regenerated DOCX
    const filename = (templateProps as any).filename ?? templateProps.name + '.docx'
    const objectName = this.storageService.generateDocumentObjectName(document.id, filename)
    const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const uploadResult = await this.storageService.uploadFile(processedBuffer, objectName, docxMimeType)

    // Generate PDF if conversion service is available
    let pdfObjectName = ''
    try {
      if (await this.conversionService.isPDFConversionAvailable()) {
        const pdfBuffer = await this.conversionService.convertDocxToPdf(processedBuffer, filename)
        if (pdfBuffer.length > 0) {
          pdfObjectName = this.storageService.generateDocumentPDFObjectName(document.id, filename)
          await this.storageService.uploadFile(pdfBuffer, pdfObjectName, 'application/pdf')
        }
      }
    } catch {
      pdfObjectName = ''
    }

    // Update document record
    document.updateFilePathDocx(objectName)
    document.updateFilePathPdf(pdfObjectName)
    document.updateFileSize(uploadResult.size)
    document.updateStatus(docProps.status)

    const saved = await this.documentRepository.save(document)
    const props = saved.getProps()

    return {
      message: 'Document regenerated successfully',
      documentId: saved.id,
      downloadUrl: `/api/documents/${saved.id}/download`,
      downloadPdfUrl: `/api/documents/${saved.id}/download?format=pdf`,
      document: {
        id: saved.id,
        templateId: props.templateId,
        userId: props.userId,
        filename: props.filename,
        filePathDocx: props.filePathDocx,
        filePathPdf: props.filePathPdf,
        fileSize: props.fileSize,
        mimeType: props.mimeType,
        status: props.status,
        createdAt: props.createdAt!,
        updatedAt: props.updatedAt!,
      },
    } as any
  }
}
