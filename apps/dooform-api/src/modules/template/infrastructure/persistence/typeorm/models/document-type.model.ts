import { Entity, Column, OneToMany } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { TemplateModel } from './template.model'

@Entity('document_types')
export class DocumentTypeModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255, default: '' })
  code!: string

  @Column({ type: 'varchar', length: 255, default: '' })
  name!: string

  @Column({ name: 'name_en', type: 'varchar', length: 255, default: '' })
  nameEn!: string

  @Column({ type: 'text', default: '' })
  description!: string

  @Column({ name: 'original_source', type: 'varchar', length: 1024, default: '' })
  originalSource!: string

  @Column({ type: 'varchar', length: 50, default: '' })
  category!: string

  @Column({ type: 'varchar', length: 255, default: '' })
  icon!: string

  @Column({ type: 'varchar', length: 50, default: '' })
  color!: string

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'json', default: '{}' })
  metadata!: string

  @OneToMany(() => TemplateModel, (template) => template.documentType)
  templates?: TemplateModel[]
}
