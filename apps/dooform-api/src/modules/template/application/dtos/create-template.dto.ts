import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TemplateTier, TemplateType } from '../../domain/enums/template.enum'

export class CreateTemplateDto {
  @ApiProperty({ example: 'Customer Feedback Form' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiPropertyOptional({ example: 'A form to collect customer feedback' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ enum: TemplateType, example: TemplateType.FORM })
  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType

  @ApiPropertyOptional({ enum: TemplateTier, example: TemplateTier.FREE })
  @IsEnum(TemplateTier)
  @IsOptional()
  tier?: TemplateTier
}
