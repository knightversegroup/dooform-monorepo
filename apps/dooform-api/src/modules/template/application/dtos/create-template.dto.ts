import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { TemplateTier, TemplateType } from '../../domain/enums/template.enum'

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType

  @IsEnum(TemplateTier)
  @IsOptional()
  tier?: TemplateTier
}
