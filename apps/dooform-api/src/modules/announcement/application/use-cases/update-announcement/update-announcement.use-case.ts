import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IAnnouncementRepository } from '../../../domain/repositories/announcement.repository'
import { UpdateAnnouncementDto } from '../../dtos/update-announcement.dto'

@Injectable()
@UseClassLogger('announcement')
export class UpdateAnnouncementUseCase implements UseCase<UpdateAnnouncementDto, any> {
  constructor(
    @Inject('IAnnouncementRepository')
    private readonly repository: IAnnouncementRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateAnnouncementDto)
  async execute(dto: UpdateAnnouncementDto): Promise<Result<any>> {
    const entity = await this.repository.findById(dto.id)
    if (!entity) {
      throw new EntityNotFoundException(`Announcement with id ${dto.id} not found`)
    }

    if (dto.message !== undefined) entity.setMessage(dto.message)
    if (dto.linkUrl !== undefined || dto.linkText !== undefined) {
      // Either side may be omitted on update — fall back to the entity's current value
      // for the side that wasn't supplied so a partial update doesn't accidentally clear it.
      const url = dto.linkUrl !== undefined ? dto.linkUrl ?? null : entity.linkUrl
      const text = dto.linkText !== undefined ? dto.linkText ?? null : entity.linkText
      entity.setLink(url, text)
    }
    if (dto.startsAt !== undefined || dto.endsAt !== undefined) {
      const startsAt = dto.startsAt !== undefined ? dto.startsAt ?? null : entity.startsAt
      const endsAt = dto.endsAt !== undefined ? dto.endsAt ?? null : entity.endsAt
      entity.setSchedule(startsAt, endsAt)
    }
    if (dto.organizationId !== undefined) {
      entity.setOrganization(dto.organizationId ?? null)
    }
    if (dto.isActive !== undefined) {
      if (dto.isActive) entity.activate()
      else entity.deactivate()
    }

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
