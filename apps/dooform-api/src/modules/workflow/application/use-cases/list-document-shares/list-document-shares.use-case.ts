import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'

export interface ListDocumentSharesDto {
  documentId: string
}

interface ListDocumentSharesResult {
  data: Array<{
    id: string
    documentId: string
    userId: string
    role: string
    grantedBy: string
    createdAt: Date | undefined
  }>
}

@Injectable()
@UseClassLogger('workflow')
export class ListDocumentSharesUseCase
  implements UseCase<ListDocumentSharesDto, ListDocumentSharesResult>
{
  constructor(
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
  ) {}

  @UseResult()
  async execute(dto: ListDocumentSharesDto): Promise<Result<ListDocumentSharesResult>> {
    const rows = await this.shares.findByDocumentId(dto.documentId)
    return {
      data: rows.map((s) => {
        const p = s.getProps()
        return {
          id: s.id,
          documentId: p.documentId,
          userId: p.userId,
          role: p.role,
          grantedBy: p.grantedBy,
          createdAt: p.createdAt,
        }
      }),
    } as any
  }
}
