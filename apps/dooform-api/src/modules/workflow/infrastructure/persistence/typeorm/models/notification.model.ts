import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { NotificationType } from '../../../../domain/enums/workflow.enum'

@Entity('notifications')
@Index('idx_notification_user_unread', ['userId', 'readAt'])
export class NotificationModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId!: string | null

  @Column({ name: 'actor_user_id', type: 'varchar', nullable: true })
  actorUserId!: string | null

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt!: Date | null
}
