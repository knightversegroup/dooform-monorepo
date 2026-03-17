import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { GetDocumentDto } from '../../dtos/get-document.dto'

interface GetDocumentResult {
  id: string
  templateId: string
  userId: string
  filename: string
  filePathDocx: string
  filePathPdf: string
  fileSize: number
  mimeType: string
  data: string
  status: string
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

    const props = document.getProps()

    return {
      id: document.id,
      templateId: props.templateId,
      userId: props.userId,
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      data: props.data,
      status: props.status,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
