import { Allow, IsNotEmpty, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { WatermarkConfig } from '../../domain/entities/watermark-preset.entity'

export class UpdateBrandingWatermarkDto {
  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  config!: WatermarkConfig

  // Injected from request context
  @Allow()
  userId!: string
}
