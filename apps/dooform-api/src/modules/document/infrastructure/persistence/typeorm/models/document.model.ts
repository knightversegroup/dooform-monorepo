import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { TemplateModel } from '../../../../../template/infrastructure/persistence/typeorm/models/template.model'
import { DocumentStatus } from '../../../../domain/enums/document.enum'

@Entity('documents')
export class DocumentModel extends BaseTypeOrmModel {
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId!: string | null

  @Column({ name: 'user_id', type: 'varchar', length: 255, default: '' })
  userId!: string

  @Column({ type: 'varchar', length: 255, default: '' })
  filename!: string

  @Column({ name: 'file_path_docx', type: 'varchar', length: 1024, default: '' })
  filePathDocx!: string

  @Column({ name: 'file_path_pdf', type: 'varchar', length: 1024, default: '' })
  filePathPdf!: string

  @Column({ name: 'file_size', type: 'bigint', default: 0 })
  fileSize!: number

  @Column({ name: 'mime_type', type: 'varchar', length: 255, default: '' })
  mimeType!: string

  @Column({ type: 'text', default: '{}' })
  data!: string

  @Column({
    type: 'varchar',
    length: 50,
    default: DocumentStatus.COMPLETED,
  })
  status!: DocumentStatus

  @ManyToOne(() => TemplateModel, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template?: TemplateModel
}
