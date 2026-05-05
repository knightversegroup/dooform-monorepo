import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { ShareRole } from '../../../../domain/enums/workflow.enum'

@Entity('document_shares')
@Index('uniq_document_share_user', ['documentId', 'userId'], { unique: true })
@Index('idx_share_user', ['userId'])
export class DocumentShareModel extends BaseTypeOrmModel {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'enum', enum: ShareRole })
  role!: ShareRole

  @Column({ name: 'granted_by', type: 'varchar' })
  grantedBy!: string
}
