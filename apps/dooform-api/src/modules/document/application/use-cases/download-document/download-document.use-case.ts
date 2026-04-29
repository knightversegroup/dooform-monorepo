import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { DocumentFormat, UserTier } from '../../../domain/enums/document.enum'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import type { IPdfConverterService } from '../../../domain/services/pdf-converter.service'
import { PdfLibManipulatorService } from '../../../infrastructure/services/pdf-lib-manipulator.service'
import { DownloadDocumentDto } from '../../dtos/download-document.dto'

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
    @Inject('IWatermarkPresetRepository')
    private readonly watermarkPresetRepository: IWatermarkPresetRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
    private readonly pdfManipulator: PdfLibManipulatorService,
  ) {}

  @UseResult()
  @ValidateInput(DownloadDocumentDto)
  async execute(dto: DownloadDocumentDto): Promise<Result<DownloadDocumentResult>> {
    const document = await this.documentRepository.findById(dto.documentId)

    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }

    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    const format = dto.format ?? DocumentFormat.PDF

    // Free tier can only download PDF
    if (format === DocumentFormat.DOCX && dto.userTier === UserTier.FREE) {
      throw new InvalidOperationException('DOCX download is not available for free tier')
    }

    if (format === DocumentFormat.DOCX) {
      const docxPath = document.filePathDocx
      if (!docxPath) {
        throw new InvalidOperationException('DOCX file not available for this document')
      }

      const buffer = await this.storageService.read(docxPath)
      return {
        buffer,
        filename: document.filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      } as any
    }

    // PDF format
    let pdfBuffer: Buffer

    // Prefer finalized PDF > base PDF > on-demand conversion
    const finalizedPath = document.filePathFinalizedPdf
    if (finalizedPath) {
      pdfBuffer = await this.storageService.read(finalizedPath)
    } else {
      const pdfPath = document.filePathPdf
      if (pdfPath) {
        pdfBuffer = await this.storageService.read(pdfPath)
      } else {
        // On-demand conversion
        const docxPath = document.filePathDocx
        if (!docxPath) {
          throw new InvalidOperationException('No document files available')
        }

        new Logger('DownloadDocumentUseCase').debug(`On-demand PDF conversion for document ${document.id}`)
        const docxBuffer = await this.storageService.read(docxPath)
        pdfBuffer = await this.pdfConverter.convertDocxToPdf(docxBuffer)

        // Cache the converted PDF
        const pdfStoragePath = `documents/${document.id}/${document.filename.replace('.docx', '.pdf')}`
        await this.storageService.save(pdfStoragePath, pdfBuffer)
      }
    }

    // Apply custom watermark if preset ID provided
    if (dto.watermarkPresetId) {
      pdfBuffer = await this.applyCustomWatermark(pdfBuffer, dto.watermarkPresetId, dto.userId)
    }

    return {
      buffer: pdfBuffer,
      filename: document.filename.replace('.docx', '.pdf'),
      mimeType: 'application/pdf',
    } as any
  }

  private async applyCustomWatermark(pdfBuffer: Buffer, presetId: string, userId: string): Promise<Buffer> {
    try {
      const preset = await this.watermarkPresetRepository.findById(presetId)
      if (!preset || !preset.isOwnedBy(userId)) {
        new Logger('DownloadDocumentUseCase').warn(`Watermark preset ${presetId} not found or not owned by user, skipping`)
        return pdfBuffer
      }

      let logoBuffer: Buffer | undefined
      if (preset.logoPath) {
        try {
          logoBuffer = await this.storageService.read(preset.logoPath)
        } catch {
          new Logger('DownloadDocumentUseCase').warn(`Failed to read logo for preset ${presetId}`)
        }
      }

      return this.pdfManipulator.applyWatermark(pdfBuffer, preset.config, logoBuffer)
    } catch (err) {
      new Logger('DownloadDocumentUseCase').warn('Failed to apply custom watermark, continuing without')
      return pdfBuffer
    }
  }
}
