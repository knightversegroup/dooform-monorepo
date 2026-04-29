import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

import { TemplateStatus, TemplateType, TemplateTier, TemplateCategory } from '../../domain/enums/template.enum'

export class GetAllTemplatesDto {
  @ApiPropertyOptional({ enum: TemplateStatus })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus

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

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsString()
  @IsOptional()
  search?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentTypeId?: string

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number

  @ApiPropertyOptional({ description: 'Group templates by document type' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  grouped?: boolean
}
