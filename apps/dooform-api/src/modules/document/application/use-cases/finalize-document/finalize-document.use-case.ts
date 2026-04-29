import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IDocumentAnnotationRepository } from '../../../domain/repositories/document-annotation.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import { PdfLibManipulatorService } from '../../../infrastructure/services/pdf-lib-manipulator.service'
import { FinalizeDocumentDto } from '../../dtos/finalize-document.dto'

interface FinalizeDocumentResult {
  message: string
  documentId: string
  filename: string
}

@Injectable()
@UseClassLogger('document')
export class FinalizeDocumentUseCase implements UseCase<FinalizeDocumentDto, FinalizeDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IDocumentAnnotationRepository')
    private readonly annotationRepository: IDocumentAnnotationRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    private readonly pdfManipulator: PdfLibManipulatorService,
  ) {}

  @UseResult()
  @ValidateInput(FinalizeDocumentDto)
  async execute(dto: FinalizeDocumentDto): Promise<Result<FinalizeDocumentResult>> {
    const document = await this.documentRepository.findById(dto.documentId)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }
    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    const annotation = await this.annotationRepository.findByDocumentId(dto.documentId)
    if (!annotation) {
      throw new EntityNotFoundException('No annotations found for this document')
    }
    if (annotation.finalized) {
      throw new InvalidOperationException('Annotations are already finalized')
    }

    // Get base PDF
    const pdfPath = document.filePathPdf
    if (!pdfPath) {
      throw new InvalidOperationException('No PDF file available for finalization')
    }

    const pdfBuffer = await this.storageService.read(pdfPath)

    // Bake annotations into PDF
    const finalizedPdf = await this.pdfManipulator.bakeAnnotations(pdfBuffer, annotation.data)

    // Save finalized PDF
    const finalizedFilename = document.filename.replace('.docx', '_finalized.pdf')
    const finalizedPath = `documents/${document.id}/${finalizedFilename}`
    await this.storageService.save(finalizedPath, finalizedPdf)

    // Update document and annotation
    document.setFilePathFinalizedPdf(finalizedPath)
    await this.documentRepository.save(document)

    annotation.finalize()
    await this.annotationRepository.save(annotation)

    new Logger('FinalizeDocumentUseCase').debug(`Document ${dto.documentId} finalized successfully`)

    return {
      message: 'Document finalized successfully',
      documentId: dto.documentId,
      filename: finalizedFilename,
    } as any
  }
}
