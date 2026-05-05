import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { InputType } from '../../../../domain/enums/input-type.enum'

@Entity('field_data_types')
@Index('uniq_field_data_type_code', ['code'], { unique: true })
export class DataTypeModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 64 })
  code!: string

  @Column({ type: 'varchar', length: 128 })
  label!: string

  @Column({ name: 'default_input_type', type: 'enum', enum: InputType })
  defaultInputType!: InputType

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'jsonb', nullable: true })
  options!: Array<{ label: string; value: string }> | null

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue!: string | null

  @Column({ name: 'suggested_values', type: 'jsonb', nullable: true })
  suggestedValues!: string[] | null

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number

  @Column({ name: 'is_built_in', type: 'boolean', default: false })
  isBuiltIn!: boolean
}
