import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { ShareRole } from '../../../domain/enums/workflow.enum'
import type { IDocumentCommentRepository } from '../../../domain/repositories/document-comment.repository'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface ListDocumentCommentsDto {
  documentId: string
  actorUserId: string
}

interface ListDocumentCommentsResult {
  data: Array<{
    id: string
    documentId: string
    userId: string
    body: string
    parentId: string | null | undefined
    createdAt: Date | undefined
  }>
}

@Injectable()
@UseClassLogger('workflow')
export class ListDocumentCommentsUseCase
  implements UseCase<ListDocumentCommentsDto, ListDocumentCommentsResult>
{
  constructor(
    @Inject('IDocumentCommentRepository')
    private readonly comments: IDocumentCommentRepository,
    private readonly access: DocumentAccessService,
  ) {}

  @UseResult()
  async execute(
    dto: ListDocumentCommentsDto,
  ): Promise<Result<ListDocumentCommentsResult>> {
    await this.access.require(dto.documentId, dto.actorUserId, ShareRole.VIEWER)
    const rows = await this.comments.findByDocumentId(dto.documentId)
    return {
      data: rows.map((c) => {
        const p = c.getProps()
        return {
          id: c.id,
          documentId: p.documentId,
          userId: p.userId,
          body: p.body,
          parentId: p.parentId,
          createdAt: p.createdAt,
        }
      }),
    } as any
  }
}
