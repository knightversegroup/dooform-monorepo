import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import {
  ActivityType,
  ShareRole,
} from '../../../domain/enums/workflow.enum'
import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface UpdateDocumentShareDto {
  documentId: string
  shareId: string
  actorUserId: string
  role: ShareRole
}

interface UpdateDocumentShareResult {
  id: string
  role: ShareRole
}

@Injectable()
@UseClassLogger('workflow')
export class UpdateDocumentShareUseCase
  implements UseCase<UpdateDocumentShareDto, UpdateDocumentShareResult>
{
  constructor(
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
  ) {}

  @UseResult()
  async execute(
    dto: UpdateDocumentShareDto,
  ): Promise<Result<UpdateDocumentShareResult>> {
    if (dto.role === ShareRole.OWNER) {
      throw new BadRequestException('Cannot promote a share to OWNER')
    }
    const summary = await this.access.resolve(dto.documentId, dto.actorUserId)
    if (!summary.isOwner) {
      throw new ForbiddenException('Only the owner can change roles')
    }
    const share = await this.shares.findById(dto.shareId)
    if (!share || share.documentId !== dto.documentId) {
      throw new NotFoundException('Share not found')
    }
    const previousRole = share.role
    share.changeRole(dto.role)
    const saved = await this.shares.save(share)

    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.ROLE_CHANGED,
      { targetUserId: share.userId, previousRole, role: dto.role },
    )

    return { id: saved.id, role: dto.role } as any
  }
}
