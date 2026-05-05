import { Allow, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import {
  TemplateTier,
  TemplateType,
  TemplateCategory,
  PageOrientation,
  TemplateVisibility,
} from '../../domain/enums/template.enum'

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

  // Type / tier / category are now references to runtime-configurable tables
  // (`template_taxonomy` for type+category, `tier_configs` for tier — admins manage
  // them at /settings/taxonomy and /settings/tiers). They're free-form strings here;
  // the use case validates against the live catalog before persisting.
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tier?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string

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

  @ApiPropertyOptional({ enum: TemplateVisibility })
  @IsEnum(TemplateVisibility)
  @IsOptional()
  visibility?: TemplateVisibility

  // Injected from request context — used to gate tier/visibility changes (only
  // GLOBAL_ADMIN may set them; everyone else's value for those fields is ignored).
  @Allow()
  callerRole?: string

  // The caller's organizationId. Used when demoting visibility from GLOBAL to
  // ORGANIZATION — the row gets re-bound to this tenant.
  @Allow()
  callerOrganizationId?: string | null

  // The caller's userId. Owners may edit their own templates regardless of role.
  @Allow()
  callerUserId?: string
}
