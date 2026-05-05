import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import {
  TemplateTaxonomyService,
} from '../../../application/services/template-taxonomy.service'
import type { TemplateTaxonomyKind } from '../../../infrastructure/persistence/typeorm/models/template-taxonomy.model'

import { JwtAuthGuard } from '../../../../auth/interface/rest/guards/jwt-auth.guard'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

class CreateTaxonomyDto {
  @IsString()
  @IsIn(['TYPE', 'TIER', 'CATEGORY'])
  kind!: TemplateTaxonomyKind

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

class UpdateTaxonomyDto {
  @IsOptional() @IsString() @MaxLength(255) label?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsInt() @Min(0) @Max(10000) sortOrder?: number
  @IsOptional() @IsBoolean() enabled?: boolean
}

@ApiTags('template-taxonomy')
@Controller('template-taxonomy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplateTaxonomyController {
  constructor(private readonly taxonomy: TemplateTaxonomyService) {}

  // List endpoints are open to any authenticated user — needed to populate the upload
  // and edit forms.
  @Get()
  list() {
    return this.taxonomy.listAll()
  }

  @Get(':kind')
  listByKind(
    @Param('kind') kind: TemplateTaxonomyKind,
    @Query('includeDisabled') includeDisabled?: string,
  ) {
    return this.taxonomy.listByKind(kind, includeDisabled === 'true')
  }

  // Mutations require the platform-level taxonomy permission.
  @Post()
  @RequirePermission('platform:taxonomy:manage')
  create(@Body() dto: CreateTaxonomyDto) {
    return this.taxonomy.create(dto)
  }

  @Patch(':id')
  @RequirePermission('platform:taxonomy:manage')
  update(@Param('id') id: string, @Body() dto: UpdateTaxonomyDto) {
    return this.taxonomy.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission('platform:taxonomy:manage')
  async remove(@Param('id') id: string) {
    await this.taxonomy.delete(id)
    return { ok: true }
  }
}
