import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import {
  ActivityType,
  NotificationType,
  ShareRole,
} from '../../../domain/enums/workflow.enum'
import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'
import { NotificationService } from '../../../domain/services/notification.service'

export interface CreateDocumentShareDto {
  documentId: string
  actorUserId: string
  targetUserId: string
  role: ShareRole
}

interface CreateDocumentShareResult {
  id: string
  documentId: string
  userId: string
  role: ShareRole
}

@Injectable()
@UseClassLogger('workflow')
export class CreateDocumentShareUseCase
  implements UseCase<CreateDocumentShareDto, CreateDocumentShareResult>
{
  constructor(
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationService,
  ) {}

  @UseResult()
  async execute(
    dto: CreateDocumentShareDto,
  ): Promise<Result<CreateDocumentShareResult>> {
    if (dto.role === ShareRole.OWNER) {
      throw new BadRequestException('Cannot grant OWNER role via share API')
    }
    const summary = await this.access.resolve(dto.documentId, dto.actorUserId)
    if (!summary.isOwner) {
      throw new ForbiddenException('Only the owner can share this document')
    }
    if (dto.targetUserId === dto.actorUserId) {
      throw new BadRequestException('Cannot share a document with yourself')
    }
    // Reject when a non-deleted share already exists. We don't block re-sharing a user
    // who was previously revoked (soft-deleted) — `restoreOrCreate` reuses that row.
    const existing = await this.shares.findByDocumentAndUser(
      dto.documentId,
      dto.targetUserId,
    )
    if (existing) {
      throw new BadRequestException('User is already shared on this document')
    }

    // restoreOrCreate looks up including soft-deleted rows and either reactivates the
    // previous one or inserts a fresh row. This avoids the unique-constraint violation
    // on `(document_id, user_id)` when the owner revokes and re-shares the same user.
    const saved = await this.shares.restoreOrCreate({
      documentId: dto.documentId,
      userId: dto.targetUserId,
      role: dto.role,
      grantedBy: dto.actorUserId,
    })

    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.SHARED,
      { targetUserId: dto.targetUserId, role: dto.role, restored: saved.restored },
    )
    await this.notifications.notify(
      dto.targetUserId,
      NotificationType.SHARED_WITH_YOU,
      dto.documentId,
      dto.actorUserId,
      { role: dto.role },
    )

    return {
      id: saved.id,
      documentId: saved.documentId,
      userId: saved.userId,
      role: saved.role as ShareRole,
    } as any
  }
}
