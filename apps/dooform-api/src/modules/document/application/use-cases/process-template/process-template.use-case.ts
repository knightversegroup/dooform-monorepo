import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../../template/domain/repositories/template.repository'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { Document } from '../../../domain/entities/document.entity'
import { ProcessTemplateDto } from '../../dtos/process-template.dto'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { ConversionService } from '../../services/conversion.service'
import { StorageService } from '../../services/storage.service'

interface ProcessTemplateResult {
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
  }
}

@Injectable()
@UseClassLogger('document')
export class ProcessTemplateUseCase implements UseCase<ProcessTemplateDto, ProcessTemplateResult> {
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
  @ValidateInput(ProcessTemplateDto)
  async execute(dto: ProcessTemplateDto): Promise<Result<ProcessTemplateResult>> {
    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    const templateProps = template.getProps()

    // Download template DOCX from storage
    const templateBuffer = await this.storageService.readFile((templateProps as any).filePathDocx ?? '')

    // Process DOCX: replace placeholders with actual data
    const processedBuffer = await this.docxProcessor.process(templateBuffer, dto.data)

    // Generate document ID and upload processed DOCX
    const documentId = Document.generateId().toValue()!
    const filename = (templateProps as any).filename ?? templateProps.name + '.docx'
    const objectName = this.storageService.generateDocumentObjectName(documentId, filename)
    const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const uploadResult = await this.storageService.uploadFile(processedBuffer, objectName, docxMimeType)

    // Generate PDF if conversion service is available
    let pdfObjectName = ''
    try {
      if (await this.conversionService.isPDFConversionAvailable()) {
        const pdfBuffer = await this.conversionService.convertDocxToPdf(processedBuffer, filename)
        if (pdfBuffer.length > 0) {
          pdfObjectName = this.storageService.generateDocumentPDFObjectName(documentId, filename)
          await this.storageService.uploadFile(pdfBuffer, pdfObjectName, 'application/pdf')
        }
      }
    } catch {
      pdfObjectName = ''
    }

    // Save document metadata
    const dataJSON = JSON.stringify(dto.data)
    const document = Document.create({
      id: documentId,
      templateId: dto.templateId,
      userId: dto.userId ?? '',
      filename,
      filePathDocx: objectName,
      filePathPdf: pdfObjectName,
      fileSize: uploadResult.size,
      mimeType: docxMimeType,
      data: dataJSON,
    })

    let saved: Document
    try {
      saved = await this.documentRepository.save(document)
    } catch (err) {
      // Cleanup uploaded files on DB save failure
      await this.storageService.deleteFile(objectName).catch(() => {})
      if (pdfObjectName) {
        await this.storageService.deleteFile(pdfObjectName).catch(() => {})
      }
      throw err
    }

    const props = saved.getProps()

    return {
      message: 'Document processed successfully',
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
      },
    } as any
  }
}
