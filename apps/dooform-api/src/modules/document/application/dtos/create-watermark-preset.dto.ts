import { Allow, IsNotEmpty, IsObject, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { WatermarkConfig } from '../../domain/entities/watermark-preset.entity'

export class CreateWatermarkPresetDto {
  @ApiProperty({ example: 'Company Watermark' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  config!: WatermarkConfig

  // Injected from request context
  @Allow()
  userId!: string
}
