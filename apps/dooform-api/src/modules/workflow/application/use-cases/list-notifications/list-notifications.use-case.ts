import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { INotificationRepository } from '../../../domain/repositories/notification.repository'

export interface ListNotificationsDto {
  userId: string
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

interface ListNotificationsResult {
  data: Array<{
    id: string
    type: string
    documentId: string | null | undefined
    actorUserId: string | null | undefined
    payload: Record<string, unknown>
    readAt: Date | null | undefined
    createdAt: Date | undefined
  }>
  total: number
  unreadCount: number
}

@Injectable()
@UseClassLogger('workflow')
export class ListNotificationsUseCase
  implements UseCase<ListNotificationsDto, ListNotificationsResult>
{
  constructor(
    @Inject('INotificationRepository')
    private readonly notifications: INotificationRepository,
  ) {}

  @UseResult()
  async execute(
    dto: ListNotificationsDto,
  ): Promise<Result<ListNotificationsResult>> {
    const result = await this.notifications.findByUserId(dto.userId, {
      unreadOnly: dto.unreadOnly,
      page: dto.page,
      pageSize: dto.pageSize,
    })
    return {
      data: result.data.map((n) => {
        const p = n.getProps()
        return {
          id: n.id,
          type: p.type,
          documentId: p.documentId,
          actorUserId: p.actorUserId,
          payload: p.payload,
          readAt: p.readAt,
          createdAt: p.createdAt,
        }
      }),
      total: result.total,
      unreadCount: result.unreadCount,
    } as any
  }
}
