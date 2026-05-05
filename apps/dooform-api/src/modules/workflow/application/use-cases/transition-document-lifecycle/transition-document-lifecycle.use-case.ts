import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { DocumentLifecycleStatus } from '../../../../document/domain/enums/document.enum'
import { DocumentModel } from '../../../../document/infrastructure/persistence/typeorm/models/document.model'
import {
  ActivityType,
  NotificationType,
  ShareRole,
} from '../../../domain/enums/workflow.enum'
import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'
import { NotificationService } from '../../../domain/services/notification.service'

const TRANSITIONS: Record<DocumentLifecycleStatus, DocumentLifecycleStatus[]> = {
  [DocumentLifecycleStatus.DRAFT]: [
    DocumentLifecycleStatus.IN_REVIEW,
    DocumentLifecycleStatus.ARCHIVED,
  ],
  [DocumentLifecycleStatus.IN_REVIEW]: [
    DocumentLifecycleStatus.DRAFT,
    DocumentLifecycleStatus.APPROVED,
    DocumentLifecycleStatus.ARCHIVED,
  ],
  [DocumentLifecycleStatus.APPROVED]: [
    DocumentLifecycleStatus.SIGNED,
    DocumentLifecycleStatus.ARCHIVED,
  ],
  [DocumentLifecycleStatus.SIGNED]: [DocumentLifecycleStatus.ARCHIVED],
  [DocumentLifecycleStatus.ARCHIVED]: [],
}

const OWNER_ONLY_TARGETS = new Set<DocumentLifecycleStatus>([
  DocumentLifecycleStatus.ARCHIVED,
  DocumentLifecycleStatus.DRAFT,
])

export interface TransitionDocumentLifecycleDto {
  documentId: string
  actorUserId: string
  to: DocumentLifecycleStatus
  note?: string
}

interface TransitionDocumentLifecycleResult {
  id: string
  lifecycleStatus: DocumentLifecycleStatus
  ownerUserId: string
}

@Injectable()
@UseClassLogger('workflow')
export class TransitionDocumentLifecycleUseCase
  implements
    UseCase<TransitionDocumentLifecycleDto, TransitionDocumentLifecycleResult>
{
  constructor(
    @InjectRepository(DocumentModel)
    private readonly documents: Repository<DocumentModel>,
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationService,
  ) {}

  @UseResult()
  async execute(
    dto: TransitionDocumentLifecycleDto,
  ): Promise<Result<TransitionDocumentLifecycleResult>> {
    const summary = await this.access.require(
      dto.documentId,
      dto.actorUserId,
      ShareRole.EDITOR,
    )
    const from = summary.document.lifecycleStatus
    const allowed = TRANSITIONS[from] ?? []
    if (!allowed.includes(dto.to)) {
      throw new BadRequestException(`Cannot transition from ${from} to ${dto.to}`)
    }
    if (OWNER_ONLY_TARGETS.has(dto.to) && !summary.isOwner) {
      throw new ForbiddenException(
        `Only the owner can move this document to ${dto.to}`,
      )
    }
    summary.document.lifecycleStatus = dto.to
    const saved = await this.documents.save(summary.document)

    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.STATE_CHANGED,
      { from, to: dto.to, note: dto.note ?? null },
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
      NotificationType.STATE_CHANGED,
      dto.documentId,
      dto.actorUserId,
      { from, to: dto.to, note: dto.note ?? null },
    )

    return {
      id: saved.id,
      lifecycleStatus: saved.lifecycleStatus,
      ownerUserId: saved.ownerUserId,
    } as any
  }
}
