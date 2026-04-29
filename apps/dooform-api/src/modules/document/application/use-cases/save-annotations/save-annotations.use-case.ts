import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException, ConcurrencyException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { DocumentAnnotation } from '../../../domain/entities/document-annotation.entity'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IDocumentAnnotationRepository } from '../../../domain/repositories/document-annotation.repository'
import { SaveAnnotationsDto } from '../../dtos/save-annotations.dto'

interface SaveAnnotationsResult {
  documentId: string
  version: number
}

@Injectable()
@UseClassLogger('document')
export class SaveAnnotationsUseCase implements UseCase<SaveAnnotationsDto, SaveAnnotationsResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IDocumentAnnotationRepository')
    private readonly annotationRepository: IDocumentAnnotationRepository,
  ) {}

  @UseResult()
  @ValidateInput(SaveAnnotationsDto)
  async execute(dto: SaveAnnotationsDto): Promise<Result<SaveAnnotationsResult>> {
    const document = await this.documentRepository.findById(dto.documentId)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }
    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    let annotation = await this.annotationRepository.findByDocumentAndUser(dto.documentId, dto.userId)

    if (annotation) {
      if (annotation.finalized) {
        throw new InvalidOperationException('Cannot modify finalized annotations')
      }
      try {
        annotation.updateData(dto.data, dto.version)
      } catch (err: any) {
        if (err.message === 'CONCURRENT_MODIFICATION') {
          throw new ConcurrencyException('Annotation version conflict. Please refresh and try again.')
        }
        throw err
      }
    } else {
      annotation = DocumentAnnotation.create({
        documentId: dto.documentId,
        userId: dto.userId,
        data: dto.data,
      })
    }

    const saved = await this.annotationRepository.save(annotation)

    return {
      documentId: dto.documentId,
      version: saved.version,
    } as any
  }
}
