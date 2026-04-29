import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { AnnotationItem } from '../../../domain/entities/document-annotation.entity'
import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IDocumentAnnotationRepository } from '../../../domain/repositories/document-annotation.repository'
import { GetDocumentDto } from '../../dtos/get-document.dto'

interface GetAnnotationsResult {
  documentId: string
  version: number
  data: AnnotationItem[]
  finalized: boolean
}

@Injectable()
@UseClassLogger('document')
export class GetAnnotationsUseCase implements UseCase<GetDocumentDto, GetAnnotationsResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IDocumentAnnotationRepository')
    private readonly annotationRepository: IDocumentAnnotationRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetDocumentDto)
  async execute(dto: GetDocumentDto): Promise<Result<GetAnnotationsResult>> {
    const document = await this.documentRepository.findById(dto.id)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }
    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    const annotation = await this.annotationRepository.findByDocumentId(dto.id)

    return {
      documentId: dto.id,
      version: annotation?.version ?? 0,
      data: annotation?.data ?? [],
      finalized: annotation?.finalized ?? false,
    } as any
  }
}
