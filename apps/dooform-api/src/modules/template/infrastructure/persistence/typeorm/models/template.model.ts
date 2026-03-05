import { Entity, Column } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  TemplateStatus,
  TemplateType,
  TemplateTier,
} from '../../../../domain/enums/template.enum'

@Entity('templates')
export class TemplateModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

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
}
