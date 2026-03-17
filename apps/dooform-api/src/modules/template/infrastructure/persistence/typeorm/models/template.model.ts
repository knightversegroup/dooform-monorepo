import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  TemplateStatus,
  TemplateType,
  TemplateTier,
  PageOrientation,
} from '../../../../domain/enums/template.enum'
import { DocumentTypeModel } from './document-type.model'

@Entity('document_templates')
export class TemplateModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255, default: '' })
  filename!: string

  @Column({ name: 'original_name', type: 'varchar', length: 255, default: '' })
  originalName!: string

  @Column({ name: 'display_name', type: 'varchar', length: 255, default: '' })
  displayName!: string

  @Column({ type: 'varchar', length: 255, default: '' })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'varchar', length: 255, default: '' })
  author!: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  category!: string | null

  @Column({ name: 'file_path_docx', type: 'varchar', length: 1024, default: '' })
  filePathDocx!: string

  @Column({ name: 'file_path_html', type: 'varchar', length: 1024, default: '' })
  filePathHtml!: string

  @Column({ name: 'file_path_pdf', type: 'varchar', length: 1024, default: '' })
  filePathPdf!: string

  @Column({ name: 'file_path_thumbnail', type: 'varchar', length: 1024, default: '' })
  filePathThumbnail!: string

  @Column({ name: 'file_size', type: 'bigint', default: 0 })
  fileSize!: number

  @Column({ name: 'mime_type', type: 'varchar', length: 255, default: '' })
  mimeType!: string

  @Column({ type: 'json', nullable: true, default: '[]' })
  placeholders!: string | null

  @Column({ type: 'json', nullable: true, default: '{}' })
  aliases!: string | null

  @Column({ name: 'field_definitions', type: 'json', nullable: true, default: '{}' })
  fieldDefinitions!: string | null

  @Column({ name: 'original_source', type: 'varchar', length: 1024, default: '' })
  originalSource!: string

  @Column({ type: 'text', default: '' })
  remarks!: string

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean

  @Column({ name: 'is_ai_available', type: 'boolean', default: false })
  isAIAvailable!: boolean

  @Column({
    type: 'varchar',
    length: 20,
    default: TemplateStatus.DRAFT,
  })
  status!: TemplateStatus

  @Column({
    type: 'varchar',
    length: 20,
    default: TemplateType.OFFICIAL,
  })
  type!: TemplateType

  @Column({
    type: 'varchar',
    length: 20,
    default: TemplateTier.FREE,
  })
  tier!: TemplateTier

  @Column({ name: 'group', type: 'varchar', length: 255, default: '' })
  group!: string

  @Column({ name: 'document_type_id', type: 'uuid', nullable: true })
  documentTypeId!: string | null

  @Column({ name: 'variant_name', type: 'varchar', length: 255, default: '' })
  variantName!: string

  @Column({ name: 'variant_order', type: 'int', default: 0 })
  variantOrder!: number

  @Column({
    name: 'page_orientation',
    type: 'varchar',
    length: 20,
    default: PageOrientation.PORTRAIT,
  })
  pageOrientation!: PageOrientation

  @ManyToOne(() => DocumentTypeModel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'document_type_id' })
  documentType?: DocumentTypeModel
}
