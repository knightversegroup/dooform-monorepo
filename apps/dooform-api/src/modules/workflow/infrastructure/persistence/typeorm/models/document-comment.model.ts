import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('document_comments')
@Index('idx_comment_document', ['documentId'])
export class DocumentCommentModel extends BaseTypeOrmModel {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'text' })
  body!: string

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null
}
