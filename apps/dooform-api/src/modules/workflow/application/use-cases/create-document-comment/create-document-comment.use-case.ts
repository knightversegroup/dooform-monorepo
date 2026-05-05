import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { DocumentComment } from '../../../domain/entities/document-comment.entity'
import {
  ActivityType,
  NotificationType,
  ShareRole,
} from '../../../domain/enums/workflow.enum'
import type { IDocumentCommentRepository } from '../../../domain/repositories/document-comment.repository'
import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'
import { NotificationService } from '../../../domain/services/notification.service'

export interface CreateDocumentCommentDto {
  documentId: string
  actorUserId: string
  body: string
  parentId?: string | null
}

interface CreateDocumentCommentResult {
  id: string
  body: string
  parentId: string | null | undefined
  createdAt: Date | undefined
}

@Injectable()
@UseClassLogger('workflow')
export class CreateDocumentCommentUseCase
  implements UseCase<CreateDocumentCommentDto, CreateDocumentCommentResult>
{
  constructor(
    @Inject('IDocumentCommentRepository')
    private readonly comments: IDocumentCommentRepository,
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationService,
  ) {}

  @UseResult()
  async execute(
    dto: CreateDocumentCommentDto,
  ): Promise<Result<CreateDocumentCommentResult>> {
    const summary = await this.access.require(
      dto.documentId,
      dto.actorUserId,
      ShareRole.COMMENTER,
    )
    const comment = DocumentComment.create({
      documentId: dto.documentId,
      userId: dto.actorUserId,
      body: dto.body,
      parentId: dto.parentId ?? null,
    })
    const saved = await this.comments.save(comment)

    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.COMMENTED,
      { commentId: saved.id },
    )

    const ownerId = summary.document.ownerUserId || summary.document.userId
    const collaborators = (
      await this.shares.findByDocumentId(dto.documentId)
    ).map((s) => s.userId)
    const audience = Array.from(new Set([ownerId, ...collaborators])).filter(
      (uid) => uid && uid !== dto.actorUserId,
    )
    await this.notifications.notify(
      audience,
      NotificationType.NEW_COMMENT,
      dto.documentId,
      dto.actorUserId,
      { commentId: saved.id, snippet: dto.body.slice(0, 120) },
    )

    const props = saved.getProps()
    return {
      id: saved.id,
      body: props.body,
      parentId: props.parentId,
      createdAt: props.createdAt,
    } as any
  }
}
