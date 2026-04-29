import { Entity, Column } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('document_types')
export class DocumentTypeModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ name: 'name_en', type: 'varchar', length: 255, nullable: true })
  nameEN!: string | null

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'original_source', type: 'varchar', length: 500, nullable: true })
  originalSource!: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null

  @Column({ type: 'varchar', length: 20, nullable: true })
  color!: string | null

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null
}
