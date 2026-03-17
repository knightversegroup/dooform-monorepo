import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

import { EventType } from '../../domain/enums/analytics.enum'

export class GetTrendsDto {
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  @Type(() => Number)
  days?: number

  @IsString()
  @IsOptional()
  templateId?: string
}

export class GetTimeSeriesDto {
  @IsEnum(EventType)
  eventType!: EventType

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  @Type(() => Number)
  days?: number

  @IsString()
  @IsOptional()
  templateId?: string
}
