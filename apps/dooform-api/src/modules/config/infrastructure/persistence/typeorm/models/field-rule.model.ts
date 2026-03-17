import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('field_rules')
export class FieldRuleModel {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar', default: '' })
  name!: string

  @Column({ type: 'varchar', default: '' })
  code!: string

  @Column({ type: 'varchar', default: '' })
  description!: string

  @Column({ type: 'varchar', default: '' })
  pattern!: string

  @Column({ type: 'varchar', name: 'input_type', default: 'text' })
  inputType!: string

  @Column({ type: 'jsonb', default: '{}' })
  validation!: string

  @Column({ type: 'jsonb', default: '[]' })
  options!: string

  @Column({ type: 'int', default: 0 })
  priority!: number

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null
}
