import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm'

@Entity('system_configs')
export class SystemConfigModel {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string

  @Column({ type: 'jsonb' })
  value!: any

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
