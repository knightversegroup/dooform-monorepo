import { Entity, Column } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  TemplateStatus,
  TemplateType,
  TemplateTier,
  TemplateCategory,
  PageOrientation,
} from '../../../../domain/enums/template.enum'
import type { FieldDefinition } from '../../../../domain/entities/field-definition.interface'

@Entity('templates')
export class TemplateModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName!: string | null

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  author!: string | null

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT,
  })
  status!: TemplateStatus

  @Column({
    type: 'enum',
    enum: TemplateType,
    default: TemplateType.FORM,
  })
  type!: TemplateType

  @Column({
    type: 'enum',
    enum: TemplateTier,
    default: TemplateTier.FREE,
  })
  tier!: TemplateTier

  @Column({
    type: 'enum',
    enum: TemplateCategory,
    nullable: true,
  })
  category!: TemplateCategory | null

  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath!: string | null

  @Column({ name: 'original_filename', type: 'varchar', length: 500, nullable: true })
  originalFilename!: string | null

  @Column({ name: 'file_path_html', type: 'text', nullable: true })
  filePathHTML!: string | null

  @Column({ name: 'file_path_pdf', type: 'text', nullable: true })
  filePathPDF!: string | null

  @Column({ name: 'file_path_thumbnail', type: 'text', nullable: true })
  filePathThumbnail!: string | null

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number | null

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType!: string | null

  @Column({ type: 'jsonb', nullable: true })
  placeholders!: string[] | null

  @Column({ type: 'jsonb', nullable: true })
  aliases!: Record<string, string> | null

  @Column({ name: 'field_definitions', type: 'jsonb', nullable: true })
  fieldDefinitions!: FieldDefinition[] | null

  @Column({ name: 'original_source', type: 'varchar', length: 500, nullable: true })
  originalSource!: string | null

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean

  @Column({ name: 'is_ai_available', type: 'boolean', default: false })
  isAIAvailable!: boolean

  @Column({ name: 'group', type: 'varchar', length: 255, nullable: true })
  group!: string | null

  @Column({ name: 'document_type_id', type: 'uuid', nullable: true })
  documentTypeId!: string | null

  @Column({ name: 'variant_name', type: 'varchar', length: 255, nullable: true })
  variantName!: string | null

  @Column({ name: 'variant_order', type: 'int', nullable: true })
  variantOrder!: number | null

  @Column({
    name: 'page_orientation',
    type: 'enum',
    enum: PageOrientation,
    nullable: true,
  })
  pageOrientation!: PageOrientation | null
}
