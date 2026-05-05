import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

import { DictionaryScope } from '../../domain/enums/dictionary.enum'

export class UpdateCollectionDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ enum: DictionaryScope })
  @IsOptional()
  @IsEnum(DictionaryScope)
  scope?: DictionaryScope

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
