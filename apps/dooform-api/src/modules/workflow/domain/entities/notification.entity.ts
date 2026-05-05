import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { NotificationType } from '../enums/workflow.enum'

export interface NotificationProps extends IEntityProps {
  userId: string
  type: NotificationType
  documentId?: string | null
  actorUserId?: string | null
  payload: Record<string, unknown>
  readAt?: Date | null
}

export class Notification extends Entity<NotificationProps> {
  static create(props: {
    userId: string
    type: NotificationType
    documentId?: string | null
    actorUserId?: string | null
    payload?: Record<string, unknown>
  }): Notification {
    return new Notification({
      userId: props.userId,
      type: props.type,
      documentId: props.documentId ?? null,
      actorUserId: props.actorUserId ?? null,
      payload: props.payload ?? {},
      readAt: null,
    })
  }

  get userId(): string { return this.getProp('userId') }
  get type(): NotificationType { return this.getProp('type') }
  get documentId(): string | null | undefined { return this.getProp('documentId') }
  get actorUserId(): string | null | undefined { return this.getProp('actorUserId') }
  get payload(): Record<string, unknown> { return this.getProp('payload') }
  get readAt(): Date | null | undefined { return this.getProp('readAt') }

  markRead(): void { this.updateProp('readAt', new Date()) }
  isUnread(): boolean { return !this.readAt }
}
