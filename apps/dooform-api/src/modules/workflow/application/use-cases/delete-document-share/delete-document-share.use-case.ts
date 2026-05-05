import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { ActivityType } from '../../../domain/enums/workflow.enum'
import type { IDocumentShareRepository } from '../../../domain/repositories/document-share.repository'
import { ActivityService } from '../../../domain/services/activity.service'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface DeleteDocumentShareDto {
  documentId: string
  shareId: string
  actorUserId: string
}

@Injectable()
@UseClassLogger('workflow')
export class DeleteDocumentShareUseCase
  implements UseCase<DeleteDocumentShareDto, { ok: true }>
{
  constructor(
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
    private readonly access: DocumentAccessService,
    private readonly activity: ActivityService,
  ) {}

  @UseResult()
  async execute(dto: DeleteDocumentShareDto): Promise<Result<{ ok: true }>> {
    const summary = await this.access.resolve(dto.documentId, dto.actorUserId)
    if (!summary.isOwner) {
      throw new ForbiddenException('Only the owner can revoke shares')
    }
    const share = await this.shares.findById(dto.shareId)
    if (!share || share.documentId !== dto.documentId) {
      throw new NotFoundException('Share not found')
    }
    await this.shares.deleteById(share.id)
    await this.activity.record(
      dto.documentId,
      dto.actorUserId,
      ActivityType.UNSHARED,
      { targetUserId: share.userId },
    )
    return { ok: true } as any
  }
}
