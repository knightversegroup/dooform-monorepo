import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsInt, IsOptional, Min } from 'class-validator'

import { StorageQuotaService } from '../../../../user/application/services/storage-quota.service'

import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

class SetQuotaDto {
  // null clears the quota (unlimited). Omit the field to reject the request.
  @IsOptional()
  @IsInt()
  @Min(0)
  quotaBytes!: number | null
}

@ApiTags('admin / tenants')
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsAdminController {
  constructor(private readonly quota: StorageQuotaService) {}

  @Get()
  @RequirePermission('platform:tenants:manage')
  async list() {
    return this.quota.listAllUsage()
  }

  @Get(':id')
  @RequirePermission('platform:tenants:manage')
  async get(@Param('id') id: string) {
    return this.quota.getUsage(id)
  }

  @Patch(':id/quota')
  @RequirePermission('platform:tenants:manage')
  async setQuota(@Param('id') id: string, @Body() dto: SetQuotaDto) {
    await this.quota.setQuota(id, dto.quotaBytes ?? null)
    return this.quota.getUsage(id)
  }

  @Post(':id/recompute')
  @RequirePermission('platform:tenants:manage')
  async recompute(@Param('id') id: string) {
    await this.quota.recompute(id)
    return this.quota.getUsage(id)
  }
}
