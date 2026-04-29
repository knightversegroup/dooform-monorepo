import { Allow, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import type { WatermarkConfig } from '../../domain/entities/watermark-preset.entity'

export class UpdateWatermarkPresetDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional({ example: 'Updated Watermark' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  config?: WatermarkConfig

  // Injected from request context
  @Allow()
  userId!: string
}
