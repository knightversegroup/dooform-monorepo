import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'

import { FilterOptionModel } from './filter-option.model'

@Entity('filter_categories')
export class FilterCategoryModel {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar', default: '' })
  code!: string

  @Column({ type: 'varchar', default: '' })
  name!: string

  @Column({ type: 'varchar', name: 'name_en', default: '' })
  nameEn!: string

  @Column({ type: 'varchar', default: '' })
  description!: string

  @Column({ type: 'varchar', name: 'field_name', default: '' })
  fieldName!: string

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean

  @OneToMany(() => FilterOptionModel, (option) => option.filterCategory)
  options!: FilterOptionModel[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null
}
