import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm'

import type { AnnotationItem } from '../../../../domain/entities/document-annotation.entity'

@Entity('document_annotations')
export class DocumentAnnotationModel {
  @PrimaryColumn('uuid')
  id!: string

  @Column({ name: 'document_id', type: 'uuid' })
  documentId!: string

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'int', default: 1 })
  version!: number

  @Column({ type: 'jsonb', default: [] })
  data!: AnnotationItem[]

  @Column({ type: 'boolean', default: false })
  finalized!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
