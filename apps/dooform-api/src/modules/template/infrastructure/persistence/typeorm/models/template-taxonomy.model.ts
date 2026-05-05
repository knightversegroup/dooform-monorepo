import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

export type TemplateTaxonomyKind = 'TYPE' | 'TIER' | 'CATEGORY'

/**
 * Configurable lookup table for the three template metadata fields whose option lists
 * were previously hardcoded in code (`TemplateType`, `TemplateTier`, `TemplateCategory`).
 *
 * `code` is the stable machine identifier (the value that lands in
 * `templates.type / .tier / .category`). `label` is the human-readable string the UI
 * shows. Admins can rename/reorder/hide entries from `/settings/taxonomy` without a
 * code change. Brand-new codes can be seeded by adding to the catalog and rebooting —
 * the seed routine inserts every catalog code that isn't yet in the table.
 */
@Entity('template_taxonomy')
@Index('uniq_template_taxonomy_kind_code', ['kind', 'code'], { unique: true })
@Index('idx_template_taxonomy_kind', ['kind'])
export class TemplateTaxonomyModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 32 })
  kind!: TemplateTaxonomyKind

  @Column({ type: 'varchar', length: 64 })
  code!: string

  @Column({ type: 'varchar', length: 255 })
  label!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'sort_order', type: 'int', default: 100 })
  sortOrder!: number

  @Column({ type: 'boolean', default: true })
  enabled!: boolean
}
