import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { DownloadDocumentDto } from '../../dtos/download-document.dto'
import { ConversionService } from '../../services/conversion.service'
import { StorageService } from '../../services/storage.service'

interface DownloadDocumentResult {
  buffer: Buffer
  filename: string
  mimeType: string
}

@Injectable()
@UseClassLogger('document')
export class DownloadDocumentUseCase implements UseCase<DownloadDocumentDto, DownloadDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    private readonly conversionService: ConversionService,
    private readonly storageService: StorageService,
  ) {}

  @UseResult()
  @ValidateInput(DownloadDocumentDto)
  async execute(dto: DownloadDocumentDto): Promise<Result<DownloadDocumentResult>> {
    const document = await this.documentRepository.findById(dto.id)

    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }

    const props = document.getProps()

    // Authorization check if userId provided
    if (dto.userId && props.userId && props.userId !== dto.userId) {
      throw new UnauthorizedAccessException("You don't have access to this document")
    }

    const format = dto.format || 'docx'

    if (format === 'pdf') {
      // Try to download existing PDF
      if (props.filePathPdf) {
        const buffer = await this.storageService.readFile(props.filePathPdf)
        const pdfFilename = props.filename.replace(/\.docx$/i, '.pdf')
        return {
          buffer,
          filename: pdfFilename,
          mimeType: 'application/pdf',
        } as any
      }

      // Try on-demand PDF conversion
      try {
        const docxBuffer = await this.storageService.readFile(props.filePathDocx)
        const pdfBuffer = await this.conversionService.convertDocxToPdf(docxBuffer, props.filename)

        // Save PDF for future requests
        const pdfObjectName = this.storageService.generateDocumentPDFObjectName(document.id, props.filename)
        await this.storageService.uploadFile(pdfBuffer, pdfObjectName, 'application/pdf').catch(() => {})

        // Persist the PDF path to DB so subsequent downloads skip conversion
        try {
          await this.documentRepository.updatePdfPath(document.id, pdfObjectName)
        } catch { /* non-critical: next download will re-convert */ }

        const pdfFilename = props.filename.replace(/\.docx$/i, '.pdf')
        return {
          buffer: pdfBuffer,
          filename: pdfFilename,
          mimeType: 'application/pdf',
        } as any
      } catch {
        throw new EntityNotFoundException('PDF version not available and conversion failed')
      }
    }

    // Default: download DOCX
    const buffer = await this.storageService.readFile(props.filePathDocx)
    return {
      buffer,
      filename: props.filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    } as any
  }
}
