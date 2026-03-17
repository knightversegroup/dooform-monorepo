import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { EventType } from '../../../../domain/enums/analytics.enum'

@Entity('statistics')
export class StatisticsModel extends BaseTypeOrmModel {
  @Index()
  @Column({ name: 'event_type', type: 'varchar', length: 50, default: '' })
  eventType!: EventType

  @Index()
  @Column({ name: 'template_id', type: 'varchar', length: 36, nullable: true })
  templateId!: string | null

  @Index()
  @Column({ type: 'date', nullable: true })
  date!: Date | null

  @Column({ type: 'bigint', default: 0 })
  count!: number
}
