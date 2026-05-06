import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, IsNull, Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  Announcement,
  type AnnouncementProps,
} from '../../../../domain/entities/announcement.entity'
import type { IAnnouncementRepository } from '../../../../domain/repositories/announcement.repository'
import { AnnouncementModel } from '../models/announcement.model'

@Injectable()
export class TypeOrmAnnouncementRepository
  extends BaseTypeOrmRepository<Announcement, AnnouncementModel>
  implements IAnnouncementRepository
{
  constructor(
    @InjectRepository(AnnouncementModel)
    repository: Repository<AnnouncementModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, AnnouncementModel)
  }

  async findActiveForOrganization(organizationId: string | null): Promise<Announcement[]> {
    const now = new Date()
    const qb = this.getRepository().createQueryBuilder('a')
      .where('a.is_active = :active', { active: true })
      .andWhere('a.deleted_at IS NULL')
      .andWhere(
        new Brackets((b) => {
          // Either a global announcement or one scoped to the caller's org.
          if (organizationId) {
            b.where('a.organization_id IS NULL').orWhere(
              'a.organization_id = :orgId',
              { orgId: organizationId },
            )
          } else {
            b.where('a.organization_id IS NULL')
          }
        }),
      )
      .andWhere(
        new Brackets((b) => {
          b.where('a.starts_at IS NULL').orWhere('a.starts_at <= :now', { now })
        }),
      )
      .andWhere(
        new Brackets((b) => {
          b.where('a.ends_at IS NULL').orWhere('a.ends_at >= :now', { now })
        }),
      )
      .orderBy('a.updated_at', 'DESC')

    const models = await qb.getMany()
    return models.map((m) => this.toEntity(m))
  }

  async findAll(): Promise<Announcement[]> {
    const models = await this.getRepository().find({
      where: { deletedAt: IsNull() },
      order: { updatedAt: 'DESC' },
    })
    return models.map((m) => this.toEntity(m))
  }

  protected toEntity(model: AnnouncementModel): Announcement {
    const props: AnnouncementProps = {
      id: model.id,
      message: model.message,
      linkUrl: model.linkUrl,
      linkText: model.linkText,
      organizationId: model.organizationId,
      isActive: model.isActive,
      startsAt: model.startsAt,
      endsAt: model.endsAt,
      createdByUserId: model.createdByUserId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (Announcement as any)(props)
  }

  protected toModel(entity: Announcement): Partial<AnnouncementModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      message: props.message,
      linkUrl: props.linkUrl,
      linkText: props.linkText,
      organizationId: props.organizationId,
      isActive: props.isActive,
      startsAt: props.startsAt,
      endsAt: props.endsAt,
      createdByUserId: props.createdByUserId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
