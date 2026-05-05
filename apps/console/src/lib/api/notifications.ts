import { http } from './client';

export type NotificationType =
  | 'SHARED_WITH_YOU'
  | 'NEW_COMMENT'
  | 'STATE_CHANGED'
  | 'SIGNATURE_REQUESTED'
  | 'SIGNED';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  documentId: string | null;
  actorUserId: string | null;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export function listNotifications(params: {
  unread?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  return http.get<{
    data: NotificationDto[];
    total: number;
    unreadCount: number;
  }>('/v1/notifications', {
    query: {
      unread: params.unread ? 'true' : undefined,
      page: params.page,
      pageSize: params.pageSize,
    },
  });
}

export function markNotificationRead(id: string) {
  return http.post<{ ok: true }>(`/v1/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return http.post<{ ok: true }>('/v1/notifications/read-all');
}
