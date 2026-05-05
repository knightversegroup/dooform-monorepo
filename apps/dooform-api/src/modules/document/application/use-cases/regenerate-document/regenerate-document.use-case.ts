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
import type { IDocumentShareRepository } from '../../../../workflow/domain/repositories/document-share.repository'
import { ShareRole } from '../../../../workflow/domain/enums/workflow.enum'
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
    @Inject('IDocumentShareRepository')
    private readonly shareRepository: IDocumentShareRepository,
  ) {}

  @UseResult()
  @ValidateInput(RegenerateDocumentDto)
  async execute(dto: RegenerateDocumentDto): Promise<Result<RegenerateDocumentResult>> {
    const existingDoc = await this.documentRepository.findById(dto.documentId)

    if (!existingDoc) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }

    // Allow access for the owner OR any user with an EDITOR / OWNER share row.
    if (!existingDoc.isOwnedBy(dto.userId)) {
      const share = await this.shareRepository.findByDocumentAndUser(
        existingDoc.id,
        dto.userId,
      )
      const role = share?.role ?? null
      if (role !== ShareRole.OWNER && role !== ShareRole.EDITOR) {
        throw new UnauthorizedAccessException(
          'You need editor access to regenerate this document',
        )
      }
    }

    // Use the caller's overridden data when provided, else replay the stored payload.
    const data = dto.data ?? existingDoc.data

    // Re-process using the chosen data
    const templatePath = `templates/${existingDoc.templateId}/template.docx`
    const templateBuffer = await this.storageService.read(templatePath)
    const processedDocx = await this.templateProcessor.processTemplate(templateBuffer, data)

    // Create new document. The actor becomes the owner of the spawn so they manage
    // its lifecycle independently of the source.
    const filename = sanitizeFilename(dto.filename) ?? `document_${Date.now()}.docx`
    const newDocument = Document.create({
      templateId: existingDoc.templateId,
      userId: dto.userId,
      filename,
      data,
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
        const pdfFilename = filename.replace(/\.docx$/i, '.pdf')
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

function sanitizeFilename(input?: string): string | null {
  if (!input) return null
  let name = input.replace(/[\\/]/g, '_').replace(/[\x00-\x1f"<>|*?]/g, '').trim()
  if (!name) return null
  if (!/\.docx$/i.test(name)) name = `${name}.docx`
  if (name.length > 255) name = name.slice(0, 250) + '.docx'
  return name
}
