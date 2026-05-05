import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  Notification,
  type NotificationProps,
} from '../../../../domain/entities/notification.entity'
import type {
  INotificationRepository,
  NotificationListOptions,
} from '../../../../domain/repositories/notification.repository'
import { NotificationModel } from '../models/notification.model'

@Injectable()
export class TypeOrmNotificationRepository
  extends BaseTypeOrmRepository<Notification, NotificationModel>
  implements INotificationRepository
{
  constructor(
    @InjectRepository(NotificationModel)
    repository: Repository<NotificationModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, NotificationModel)
  }

  async findByUserId(
    userId: string,
    options: NotificationListOptions,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const page = options.page ?? 0
    const pageSize = options.pageSize ?? 50
    const where = options.unreadOnly ? { userId, readAt: IsNull() } : { userId }
    const [rows, total] = await this.getRepository().findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    })
    const unreadCount = await this.getRepository().count({
      where: { userId, readAt: IsNull() },
    })
    return {
      data: rows.map((m) => this.toEntity(m)),
      total,
      unreadCount,
    }
  }

  async markRead(userId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return
    await this.getRepository().update({ userId, id: In(ids) }, { readAt: new Date() })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.getRepository().update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    )
  }

  protected toEntity(model: NotificationModel): Notification {
    const props: NotificationProps = {
      id: model.id,
      userId: model.userId,
      type: model.type,
      documentId: model.documentId,
      actorUserId: model.actorUserId,
      payload: model.payload ?? {},
      readAt: model.readAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (Notification as any)(props)
  }

  protected toModel(entity: Notification): Partial<NotificationModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      userId: props.userId,
      type: props.type,
      documentId: props.documentId ?? null,
      actorUserId: props.actorUserId ?? null,
      payload: props.payload,
      readAt: props.readAt ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
