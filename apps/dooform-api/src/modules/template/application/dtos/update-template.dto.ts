import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TemplateTier, TemplateType, TemplateCategory, PageOrientation } from '../../domain/enums/template.enum'

export class UpdateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  author?: string

  @ApiPropertyOptional({ enum: TemplateType })
  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType

  @ApiPropertyOptional({ enum: TemplateTier })
  @IsEnum(TemplateTier)
  @IsOptional()
  tier?: TemplateTier

  @ApiPropertyOptional({ enum: TemplateCategory })
  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory

  @ApiPropertyOptional({ enum: PageOrientation })
  @IsEnum(PageOrientation)
  @IsOptional()
  pageOrientation?: PageOrientation

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  remarks?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  group?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAIAvailable?: boolean
}
