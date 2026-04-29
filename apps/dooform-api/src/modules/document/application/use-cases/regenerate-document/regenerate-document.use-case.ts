import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Document } from '../../../domain/entities/document.entity'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import type { ITemplateProcessorService } from '../../../domain/services/template-processor.service'
import type { IPdfConverterService } from '../../../domain/services/pdf-converter.service'
import { RegenerateDocumentDto } from '../../dtos/regenerate-document.dto'

interface RegenerateDocumentResult {
  id: string
  filename: string
  filePathDocx: string | null | undefined
  filePathPdf: string | null | undefined
  status: string
  createdAt: Date
}

@Injectable()
@UseClassLogger('document')
export class RegenerateDocumentUseCase implements UseCase<RegenerateDocumentDto, RegenerateDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('ITemplateProcessorService')
    private readonly templateProcessor: ITemplateProcessorService,
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
  ) {}

  @UseResult()
  @ValidateInput(RegenerateDocumentDto)
  async execute(dto: RegenerateDocumentDto): Promise<Result<RegenerateDocumentResult>> {
    const existingDoc = await this.documentRepository.findById(dto.documentId)

    if (!existingDoc) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }

    if (!existingDoc.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    // Re-process using stored data
    const templatePath = `templates/${existingDoc.templateId}/template.docx`
    const templateBuffer = await this.storageService.read(templatePath)
    const processedDocx = await this.templateProcessor.processTemplate(templateBuffer, existingDoc.data)

    // Create new document
    const filename = `document_${Date.now()}.docx`
    const newDocument = Document.create({
      templateId: existingDoc.templateId,
      userId: dto.userId,
      filename,
      data: existingDoc.data,
    })

    // Save DOCX
    const docxPath = `documents/${newDocument.id}/${filename}`
    await this.storageService.save(docxPath, processedDocx)
    newDocument.setFilePathDocx(docxPath)
    newDocument.setFileSize(processedDocx.length)
    newDocument.setMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    // Convert to PDF
    try {
      const isAvailable = await this.pdfConverter.isAvailable()
      if (isAvailable) {
        const pdfBuffer = await this.pdfConverter.convertDocxToPdf(processedDocx)
        const pdfFilename = filename.replace('.docx', '.pdf')
        const pdfPath = `documents/${newDocument.id}/${pdfFilename}`
        await this.storageService.save(pdfPath, pdfBuffer)
        newDocument.setFilePathPdf(pdfPath)
      }
    } catch (err) {
      new Logger('RegenerateDocumentUseCase').error('PDF conversion failed during regeneration', err instanceof Error ? err : undefined)
    }

    newDocument.markCompleted()
    const saved = await this.documentRepository.save(newDocument)
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
}
