import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentStatus, DocumentLifecycleStatus } from '../../../../domain/enums/document.enum'

@Entity('documents')
@Index('idx_documents_owner_user', ['ownerUserId'])
@Index('idx_documents_lifecycle', ['lifecycleStatus'])
export class DocumentModel extends BaseTypeOrmModel {
  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ name: 'owner_user_id', type: 'varchar', default: '' })
  ownerUserId!: string

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ type: 'varchar', length: 500 })
  filename!: string

  @Column({ name: 'file_path_docx', type: 'text', nullable: true })
  filePathDocx!: string | null

  @Column({ name: 'file_path_pdf', type: 'text', nullable: true })
  filePathPdf!: string | null

  @Column({ name: 'file_path_finalized_pdf', type: 'text', nullable: true })
  filePathFinalizedPdf!: string | null

  @Column({ type: 'jsonb', default: {} })
  data!: Record<string, string>

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PROCESSING,
  })
  status!: DocumentStatus

  @Column({
    name: 'lifecycle_status',
    type: 'enum',
    enum: DocumentLifecycleStatus,
    default: DocumentLifecycleStatus.DRAFT,
  })
  lifecycleStatus!: DocumentLifecycleStatus

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number | null

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType!: string | null
}
