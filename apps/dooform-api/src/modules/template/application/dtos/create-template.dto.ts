import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TemplateTier, TemplateType, TemplateCategory, PageOrientation } from '../../domain/enums/template.enum'

export class CreateTemplateDto {
  @ApiProperty({ example: 'Customer Feedback Form' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiPropertyOptional({ example: 'Customer Feedback' })
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiPropertyOptional({ example: 'A form to collect customer feedback' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'Admin' })
  @IsString()
  @IsOptional()
  author?: string

  @ApiPropertyOptional({ enum: TemplateType, example: TemplateType.FORM })
  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType

  @ApiPropertyOptional({ enum: TemplateTier, example: TemplateTier.FREE })
  @IsEnum(TemplateTier)
  @IsOptional()
  tier?: TemplateTier

  @ApiPropertyOptional({ enum: TemplateCategory, example: TemplateCategory.OTHER })
  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory

  @ApiPropertyOptional({ enum: PageOrientation, example: PageOrientation.PORTRAIT })
  @IsEnum(PageOrientation)
  @IsOptional()
  pageOrientation?: PageOrientation
}
