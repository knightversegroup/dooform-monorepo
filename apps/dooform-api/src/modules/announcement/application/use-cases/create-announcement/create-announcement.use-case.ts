import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import { Announcement } from '../../../domain/entities/announcement.entity'
import type { IAnnouncementRepository } from '../../../domain/repositories/announcement.repository'
import { CreateAnnouncementDto } from '../../dtos/create-announcement.dto'

@Injectable()
@UseClassLogger('announcement')
export class CreateAnnouncementUseCase implements UseCase<CreateAnnouncementDto, any> {
  constructor(
    @Inject('IAnnouncementRepository')
    private readonly repository: IAnnouncementRepository,
  ) {}

  @UseResult()
  @ValidateInput(CreateAnnouncementDto)
  async execute(dto: CreateAnnouncementDto): Promise<Result<any>> {
    if (!dto.createdByUserId) {
      throw new Error('createdByUserId is required to create an announcement')
    }
    const entity = Announcement.create({
      message: dto.message,
      linkUrl: dto.linkUrl ?? null,
      linkText: dto.linkText ?? null,
      organizationId: dto.organizationId ?? null,
      isActive: dto.isActive ?? true,
      startsAt: dto.startsAt ?? null,
      endsAt: dto.endsAt ?? null,
      createdByUserId: dto.createdByUserId,
    })
    const saved = await this.repository.save(entity)
    const p = saved.getProps()
    return {
      id: saved.id,
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
    } as any
  }
}
