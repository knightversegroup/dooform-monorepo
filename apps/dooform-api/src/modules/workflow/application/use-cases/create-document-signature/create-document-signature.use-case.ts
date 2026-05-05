import {
  BadRequestException,
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
import { DocumentSignature } from '../../../domain/entities/document-signature.entity'
import {
  ActivityType,
  NotificationType,
  ShareRole,
} from '../../../domain/enums/workflow.enum'
import type { IDocumentSignatureRepository } from '../../../domain/repositories/document-signature.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'
import { NotificationService } from '../../../domain/services/notification.service'

export interface CreateDocumentSignatureDto {
  documentId: string
  actorUserId: string
  imageBuffer: Buffer
  imageMime: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
}

interface CreateDocumentSignatureResult {
  id: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
  signedAt: Date
}

@Injectable()
@UseClassLogger('workflow')
export class CreateDocumentSignatureUseCase
  implements UseCase<CreateDocumentSignatureDto, CreateDocumentSignatureResult>
{
  constructor(
    @InjectRepository(DocumentModel)
    private readonly documents: Repository<DocumentModel>,
    @Inject('IDocumentSignatureRepository')
    private readonly signatures: IDocumentSignatureRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationService,
  ) {}

  @UseResult()
  async execute(
    dto: CreateDocumentSignatureDto,
  ): Promise<Result<CreateDocumentSignatureResult>> {
    const summary = await this.access.require(
      dto.documentId,
      dto.actorUserId,
      ShareRole.EDITOR,
    )
    if (
      summary.document.lifecycleStatus !== DocumentLifecycleStatus.APPROVED &&
      summary.document.lifecycleStatus !== DocumentLifecycleStatus.SIGNED
    ) {
      throw new BadRequestException(
        'Document must be APPROVED or SIGNED before adding signatures',
      )
    }

    const dataUrl = `data:${dto.imageMime};base64,${dto.imageBuffer.toString('base64')}`

    const signature = DocumentSignature.create({
      documentId: dto.documentId,
      userId: dto.actorUserId,
      imagePath: dataUrl,
      pageIndex: dto.pageIndex,
      x: dto.x,
      y: dto.y,
      width: dto.width,
      height: dto.height,
    })
    const saved = await this.signatures.save(signature)

    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.SIGNED,
      { signatureId: saved.id, pageIndex: dto.pageIndex },
    )

    // Auto-promote APPROVED → SIGNED on the first signature
    if (summary.document.lifecycleStatus === DocumentLifecycleStatus.APPROVED) {
      summary.document.lifecycleStatus = DocumentLifecycleStatus.SIGNED
      await this.documents.save(summary.document)
      await this.activity.record(
        dto.documentId,
        dto.actorUserId,
        ActivityType.STATE_CHANGED,
        {
          from: DocumentLifecycleStatus.APPROVED,
          to: DocumentLifecycleStatus.SIGNED,
          automatic: true,
        },
      )
    }

    const ownerId = summary.document.ownerUserId || summary.document.userId
    if (ownerId !== dto.actorUserId) {
      await this.notifications.notify(
        ownerId,
        NotificationType.SIGNED,
        dto.documentId,
        dto.actorUserId,
        { signatureId: saved.id },
      )
    }

    const p = saved.getProps()
    return {
      id: saved.id,
      pageIndex: p.pageIndex,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      signedAt: p.signedAt,
    } as any
  }
}
