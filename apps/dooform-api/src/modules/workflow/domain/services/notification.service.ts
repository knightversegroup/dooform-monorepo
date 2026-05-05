import { Inject, Injectable } from '@nestjs/common'

import { NotificationType } from '../enums/workflow.enum'
import { Notification } from '../entities/notification.entity'
import type { INotificationRepository } from '../repositories/notification.repository'

/**
 * Domain service that fan-outs notification rows for a set of users.
 */
@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notifications: INotificationRepository,
  ) {}

  async notify(
    userIds: string[] | string,
    type: NotificationType,
    documentId: string | null,
    actorUserId: string | null,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    const ids = Array.isArray(userIds) ? userIds : [userIds]
    if (ids.length === 0) return
    for (const userId of ids) {
      const n = Notification.create({
        userId,
        type,
        documentId,
        actorUserId,
        payload,
      })
      await this.notifications.save(n)
    }
  }
}
