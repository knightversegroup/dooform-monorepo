import {
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
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import { TierConfigService } from '../../../../user/application/services/tier-config.service'

import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RequirePermission } from '../decorators/require-permission.decorator'

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

  @Post()
  @RequirePermission('platform:tiers:manage')
  create(@Body() dto: CreateTierDto) {
    return this.tiers.create(dto)
  }

  @Patch(':id')
  @RequirePermission('platform:tiers:manage')
  update(@Param('id') id: string, @Body() dto: UpdateTierDto) {
    return this.tiers.update(id, dto)
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
  constructor(private readonly tiers: TierConfigService) {}

  @Get()
  async list() {
    const all = await this.tiers.list()
    return all.filter((t) => t.enabled)
  }
}
