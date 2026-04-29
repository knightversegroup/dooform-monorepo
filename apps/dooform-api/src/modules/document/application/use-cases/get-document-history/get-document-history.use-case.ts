import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { GetDocumentHistoryDto } from '../../dtos/get-document-history.dto'

interface DocumentHistoryItem {
  id: string
  templateId: string
  filename: string
  filePathDocx: string | null | undefined
  filePathPdf: string | null | undefined
  status: string
  createdAt: Date
}

interface GetDocumentHistoryResult {
  data: DocumentHistoryItem[]
  total: number
  page: number
  pageSize: number
}

@Injectable()
@UseClassLogger('document')
export class GetDocumentHistoryUseCase implements UseCase<GetDocumentHistoryDto, GetDocumentHistoryResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
  ) {}

  @UseResult()
  async execute(dto: GetDocumentHistoryDto): Promise<Result<GetDocumentHistoryResult>> {
    const page = dto.page ?? 0
    const pageSize = dto.pageSize ?? 20

    const { data, total } = await this.documentRepository.findByUserId(dto.userId, page, pageSize)

    const items: DocumentHistoryItem[] = data.map((doc) => {
      const props = doc.getProps()
      return {
        id: doc.id,
        templateId: props.templateId,
        filename: props.filename,
        filePathDocx: props.filePathDocx,
        filePathPdf: props.filePathPdf,
        status: props.status,
        createdAt: props.createdAt!,
      }
    })

    return {
      data: items,
      total,
      page,
      pageSize,
    } as any
  }
}
