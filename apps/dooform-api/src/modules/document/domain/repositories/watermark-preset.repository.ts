import type { IRepository } from '@dooform-api-core/domain'

import type { WatermarkPreset } from '../entities/watermark-preset.entity'

export interface IWatermarkPresetRepository extends IRepository<WatermarkPreset> {
  findByUserId(userId: string): Promise<WatermarkPreset[]>
}
