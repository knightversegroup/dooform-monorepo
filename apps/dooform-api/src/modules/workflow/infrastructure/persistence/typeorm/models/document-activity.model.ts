import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { ActivityType } from '../../../../domain/enums/workflow.enum'

@Entity('document_activities')
@Index('idx_activity_document', ['documentId'])
export class DocumentActivityModel extends BaseTypeOrmModel {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'enum', enum: ActivityType })
  type!: ActivityType

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>
}
