import {
  Allow,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateEntryDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  term?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  termTh?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  definition?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  definitionTh?: string | null

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
