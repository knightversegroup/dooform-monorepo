import { Entity, Column } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import type { WatermarkConfig } from '../../../../domain/entities/watermark-preset.entity'

@Entity('watermark_presets')
export class WatermarkPresetModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'jsonb' })
  config!: WatermarkConfig

  @Column({ name: 'logo_path', type: 'text', nullable: true })
  logoPath!: string | null
}
