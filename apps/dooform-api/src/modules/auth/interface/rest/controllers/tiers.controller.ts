import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import {
  CAPABILITIES,
  CAPABILITY_KEYS,
  LIMITS,
  LIMIT_KEYS,
} from '../../../domain/capabilities.catalog'
import { TierConfigService } from '../../../../user/application/services/tier-config.service'
import { TierService } from '../../../../user/application/services/tier.service'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { CurrentUser } from '../decorators/current-user.decorator'
import type { AuthenticatedUser } from '../types/authenticated-user'

class CreateTierDto {
  @IsString() @MinLength(1) @MaxLength(32) code!: string
  @IsString() @MinLength(1) @MaxLength(100) label!: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsBoolean() applyBrandingWatermark?: boolean
  @IsOptional() @IsInt() @Min(0) @Max(10000) sortOrder?: number
  @IsOptional() @IsBoolean() enabled?: boolean
}

class UpdateTierDto {
  @IsOptional() @IsString() @MaxLength(100) label?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsBoolean() applyBrandingWatermark?: boolean
  @IsOptional() @IsInt() @Min(0) @Max(10000) sortOrder?: number
  @IsOptional() @IsBoolean() enabled?: boolean
  @IsOptional() @IsObject() features?: Record<string, unknown> | null
}

/**
 * Validate that `features` only contains keys from the catalog. Drops unknown
 * capabilities/limits silently — keeps the DB clean even if a stale frontend
 * sends a removed key.
 */
function sanitizeFeatures(
  features: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (features === null) return null
  if (features === undefined) return null
  const out: Record<string, unknown> = {}
  if (Array.isArray((features as { capabilities?: unknown }).capabilities)) {
    const caps = ((features as { capabilities: unknown[] }).capabilities).filter(
      (c): c is string => {
        if (typeof c !== 'string') return false
        // Allow leading "-" to signal explicit revoke.
        const key = c.startsWith('-') ? c.slice(1) : c
        return CAPABILITY_KEYS.has(key)
      },
    )
    out.capabilities = caps
  }
  const limits = (features as { limits?: unknown }).limits
  if (limits && typeof limits === 'object' && !Array.isArray(limits)) {
    const cleaned: Record<string, number | null> = {}
    for (const [k, v] of Object.entries(limits as Record<string, unknown>)) {
      if (!LIMIT_KEYS.has(k)) continue
      if (v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0)) {
        cleaned[k] = v as number | null
      } else {
        throw new BadRequestException(
          `limits.${k} must be a non-negative number or null (unlimited)`,
        )
      }
    }
    out.limits = cleaned
  }
  return Object.keys(out).length > 0 ? out : null
}

@ApiTags('admin / tiers')
@Controller('admin/tiers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TiersAdminController {
  constructor(private readonly tiers: TierConfigService) {}

  @Get()
  @RequirePermission('platform:tiers:manage')
  list() {
    return this.tiers.list()
  }

  /**
   * Returns the static capability + limit catalog so the admin UI knows what
   * checkboxes / inputs to render. Catalog lives in code (not the DB), so this
   * is essentially free to compute.
   */
  @Get('catalog')
  @RequirePermission('platform:tiers:manage')
  catalog() {
    return {
      capabilities: CAPABILITIES,
      limits: LIMITS,
    }
  }

  @Post()
  @RequirePermission('platform:tiers:manage')
  create(@Body() dto: CreateTierDto) {
    return this.tiers.create(dto)
  }

  @Patch(':id')
  @RequirePermission('platform:tiers:manage')
  update(@Param('id') id: string, @Body() dto: UpdateTierDto) {
    return this.tiers.update(id, {
      ...dto,
      features:
        dto.features === undefined ? undefined : sanitizeFeatures(dto.features),
    })
  }

  @Delete(':id')
  @RequirePermission('platform:tiers:manage')
  async remove(@Param('id') id: string) {
    await this.tiers.delete(id)
    return { ok: true }
  }
}

/**
 * Read-only tier listing for any authenticated user. Used by template upload + edit
 * forms to populate the tier dropdown — same source of truth as `/admin/tiers`.
 * Returns only `enabled` rows, sorted by `sortOrder`.
 */
@ApiTags('tiers')
@Controller('tiers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TiersPublicController {
  constructor(
    private readonly tiers: TierConfigService,
    private readonly tierService: TierService,
  ) {}

  @Get()
  async list() {
    const all = await this.tiers.list()
    return all.filter((t) => t.enabled)
  }

  /**
   * Returns the *current user's* resolved tier — code, label, sortOrder,
   * effective capabilities, and limits. Frontend calls this to refresh tier
   * state after a tier change (since /auth/me also includes it, but this is the
   * cheaper "just the tier" endpoint).
   */
  @Get('me')
  async myTier(@CurrentUser() user: AuthenticatedUser) {
    return this.tierService.listEffectiveForOrg(user.organizationId)
  }
}
