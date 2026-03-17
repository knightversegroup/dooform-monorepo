import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('input_types')
export class InputTypeModel {
  @PrimaryColumn({ type: 'varchar' })
  id!: string

  @Column({ type: 'varchar', default: '' })
  code!: string

  @Column({ type: 'varchar', default: '' })
  name!: string

  @Column({ type: 'varchar', default: '' })
  description!: string

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
