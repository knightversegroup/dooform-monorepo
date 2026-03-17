import { IsEnum, IsOptional, IsString } from 'class-validator'

import { EventType } from '../../domain/enums/analytics.enum'

export class RecordEventDto {
  @IsEnum(EventType)
  eventType!: EventType

  @IsString()
  @IsOptional()
  templateId?: string
}
