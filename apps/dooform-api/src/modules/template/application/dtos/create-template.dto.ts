import { Allow, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import {
  TemplateTier,
  TemplateType,
  TemplateCategory,
  PageOrientation,
  TemplateVisibility,
} from '../../domain/enums/template.enum'

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

  // Type / tier / category are runtime-configurable codes from the taxonomy and
  // tier-config tables. Validated as plain strings here; the use case re-checks
  // against the live catalog and rejects unknown codes.
  @ApiPropertyOptional({ example: 'FORM' })
  @IsString()
  @IsOptional()
  type?: string

  @ApiPropertyOptional({ example: 'free' })
  @IsString()
  @IsOptional()
  tier?: string

  @ApiPropertyOptional({ example: 'OTHER' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ enum: PageOrientation, example: PageOrientation.PORTRAIT })
  @IsEnum(PageOrientation)
  @IsOptional()
  pageOrientation?: PageOrientation

  @ApiPropertyOptional({
    enum: TemplateVisibility,
    description: 'GLOBAL is reserved for GLOBAL_ADMIN — silently downgraded to ORGANIZATION otherwise.',
  })
  @IsEnum(TemplateVisibility)
  @IsOptional()
  visibility?: TemplateVisibility

  // Injected from request context
  @Allow()
  organizationId!: string | null

  @Allow()
  callerRole!: string

  @Allow()
  ownerUserId!: string
}
