import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('document_signatures')
@Index('idx_signature_document', ['documentId'])
export class DocumentSignatureModel extends BaseTypeOrmModel {
  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ name: 'image_path', type: 'text' })
  imagePath!: string

  @Column({ name: 'page_index', type: 'int' })
  pageIndex!: number

  @Column({ type: 'real' })
  x!: number

  @Column({ type: 'real' })
  y!: number

  @Column({ type: 'real' })
  width!: number

  @Column({ type: 'real' })
  height!: number

  @Column({ name: 'signed_at', type: 'timestamp with time zone' })
  signedAt!: Date
}
