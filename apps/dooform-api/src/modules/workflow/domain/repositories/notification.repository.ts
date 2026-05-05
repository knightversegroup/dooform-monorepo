import type { IRepository } from '@dooform-api-core/domain'

import type { Notification } from '../entities/notification.entity'

export interface NotificationListOptions {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}

export interface INotificationRepository extends IRepository<Notification> {
  findByUserId(
    userId: string,
    options: NotificationListOptions,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }>
  markRead(userId: string, ids: string[]): Promise<void>
  markAllRead(userId: string): Promise<void>
}
