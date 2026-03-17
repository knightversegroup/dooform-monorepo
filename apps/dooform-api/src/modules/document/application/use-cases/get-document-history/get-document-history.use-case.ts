import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { GetDocumentHistoryDto } from '../../dtos/get-document-history.dto'

interface DocumentHistoryItem {
  id: string
  templateId: string
  userId: string
  filename: string
  fileSize: number
  mimeType: string
  status: string
  createdAt: Date
}

interface GetDocumentHistoryResult {
  documents: DocumentHistoryItem[]
  total: number
  page: number
  limit: number
}

@Injectable()
@UseClassLogger('document')
export class GetDocumentHistoryUseCase implements UseCase<GetDocumentHistoryDto, GetDocumentHistoryResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetDocumentHistoryDto)
  async execute(dto: GetDocumentHistoryDto): Promise<Result<GetDocumentHistoryResult>> {
    const page = dto.page ?? 1
    const limit = dto.limit ?? 20

    const result = await this.documentRepository.findByUserIdPaginated(dto.userId, page, limit)

    const documents = result.data.map((doc) => {
      const props = doc.getProps()
      return {
        id: doc.id,
        template_id: props.templateId,
        user_id: props.userId,
        filename: props.filename,
        file_size: props.fileSize,
        mime_type: props.mimeType,
        status: props.status,
        created_at: props.createdAt ?? null,
        updated_at: props.updatedAt ?? null,
      }
    })

    const totalPages = Math.ceil(result.total / limit) || 1

    return {
      documents,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: totalPages,
      },
    } as any
  }
}
