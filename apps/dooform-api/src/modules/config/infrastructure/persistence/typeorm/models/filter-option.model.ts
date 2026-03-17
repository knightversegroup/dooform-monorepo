import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'

import { FilterCategoryModel } from './filter-category.model'

@Entity('filter_options')
export class FilterOptionModel {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar', name: 'filter_category_id', default: '' })
  filterCategoryId!: string

  @Column({ type: 'varchar', default: '' })
  value!: string

  @Column({ type: 'varchar', default: '' })
  label!: string

  @Column({ type: 'varchar', name: 'label_en', default: '' })
  labelEn!: string

  @Column({ type: 'varchar', default: '' })
  description!: string

  @Column({ type: 'varchar', default: '' })
  color!: string

  @Column({ type: 'varchar', default: '' })
  icon!: string

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault!: boolean

  @ManyToOne(() => FilterCategoryModel, (category) => category.options)
  @JoinColumn({ name: 'filter_category_id' })
  filterCategory!: FilterCategoryModel

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null
}
