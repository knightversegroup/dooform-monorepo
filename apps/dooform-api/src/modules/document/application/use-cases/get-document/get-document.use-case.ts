import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { GetDocumentDto } from '../../dtos/get-document.dto'

interface GetDocumentResult {
  id: string
  templateId: string
  filename: string
  filePathDocx: string | null | undefined
  filePathPdf: string | null | undefined
  filePathFinalizedPdf: string | null | undefined
  data: Record<string, string>
  status: string
  fileSize: number | null | undefined
  mimeType: string | null | undefined
  createdAt: Date
  updatedAt: Date
}

@Injectable()
@UseClassLogger('document')
export class GetDocumentUseCase implements UseCase<GetDocumentDto, GetDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetDocumentDto)
  async execute(dto: GetDocumentDto): Promise<Result<GetDocumentResult>> {
    const document = await this.documentRepository.findById(dto.id)

    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }

    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    const props = document.getProps()

    return {
      id: document.id,
      templateId: props.templateId,
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf,
      filePathFinalizedPdf: props.filePathFinalizedPdf,
      data: props.data,
      status: props.status,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
