import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { DictionaryScope } from '../../domain/enums/dictionary.enum'

export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiProperty({ enum: DictionaryScope })
  @IsEnum(DictionaryScope)
  scope!: DictionaryScope

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
