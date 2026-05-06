import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { Announcement } from '../../../domain/entities/announcement.entity'
import type { IAnnouncementRepository } from '../../../domain/repositories/announcement.repository'
import { ListAllAnnouncementsDto } from '../../dtos/list-all-announcements.dto'

@Injectable()
@UseClassLogger('announcement')
export class ListAllAnnouncementsUseCase
  implements UseCase<ListAllAnnouncementsDto, any>
{
  constructor(
    @Inject('IAnnouncementRepository')
    private readonly repository: IAnnouncementRepository,
  ) {}

  @UseResult()
  async execute(_dto: ListAllAnnouncementsDto): Promise<Result<any>> {
    const items = await this.repository.findAll()
    return items.map(toResponse) as any
  }
}

function toResponse(a: Announcement) {
  const p = a.getProps()
  return {
    id: a.id,
    message: p.message,
    linkUrl: p.linkUrl,
    linkText: p.linkText,
    organizationId: p.organizationId,
    isActive: p.isActive,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
    createdByUserId: p.createdByUserId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}
