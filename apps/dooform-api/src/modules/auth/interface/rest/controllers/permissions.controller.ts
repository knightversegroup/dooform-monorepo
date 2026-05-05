import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'

import { PermissionService } from '../../../application/services/permission.service'
import { UserRole } from '../../../../user/domain/enums/user.enum'

import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'

class UpdateRoleGrantsDto {
  @IsArray()
  @IsString({ each: true })
  permissions!: string[]
}

@ApiTags('admin / permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissions: PermissionService) {}

  // The catalog is read-only and useful to anyone building UI; gating it behind
  // platform:permissions:manage keeps it admin-only.
  @Get('catalog')
  @RequirePermission('platform:permissions:manage')
  catalog() {
    return this.permissions.catalog()
  }

  @Get('grants')
  @RequirePermission('platform:permissions:manage')
  grants() {
    return this.permissions.grants()
  }

  @Put('grants/:role')
  @RequirePermission('platform:permissions:manage')
  async setGrants(@Param('role') role: string, @Body() dto: UpdateRoleGrantsDto) {
    const r = role as UserRole
    if (!Object.values(UserRole).includes(r)) {
      return { ok: false, error: 'invalid role' }
    }
    await this.permissions.setGrantsBulk(r, dto.permissions)
    return { ok: true, role: r, permissions: this.permissions.grants()[r] }
  }
}
