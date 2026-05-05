import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { IDocumentCommentRepository } from '../../../domain/repositories/document-comment.repository'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface DeleteDocumentCommentDto {
  documentId: string
  commentId: string
  actorUserId: string
}

@Injectable()
@UseClassLogger('workflow')
export class DeleteDocumentCommentUseCase
  implements UseCase<DeleteDocumentCommentDto, { ok: true }>
{
  constructor(
    @Inject('IDocumentCommentRepository')
    private readonly comments: IDocumentCommentRepository,
    private readonly access: DocumentAccessService,
  ) {}

  @UseResult()
  async execute(
    dto: DeleteDocumentCommentDto,
  ): Promise<Result<{ ok: true }>> {
    const comment = await this.comments.findById(dto.commentId)
    if (!comment || comment.documentId !== dto.documentId) {
      throw new NotFoundException('Comment not found')
    }
    const summary = await this.access.resolve(dto.documentId, dto.actorUserId)
    const isAuthor = comment.userId === dto.actorUserId
    if (!isAuthor && !summary.isOwner) {
      throw new ForbiddenException(
        'Only the author or document owner can delete a comment',
      )
    }
    await this.comments.deleteById(comment.id)
    return { ok: true } as any
  }
}
