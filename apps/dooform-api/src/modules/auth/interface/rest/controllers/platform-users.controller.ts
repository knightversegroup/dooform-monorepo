import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { PlatformDirectoryService } from '../../../../user/application/services/platform-directory.service'

import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

/**
 * Cross-org user directory for global admins. Mirrors the tenants admin pattern
 * but for principals. Gated on `platform:tenants:manage` so anyone who can see
 * orgs can also see who's in them — without granting role-mutation power.
 */
@ApiTags('admin / users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlatformUsersController {
  constructor(private readonly directory: PlatformDirectoryService) {}

  @Get()
  @RequirePermission('platform:tenants:manage')
  async list(
    @Query('organizationId') organizationId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    // `?organizationId=none` filters to users not yet in any org.
    const orgFilter =
      organizationId === 'none' ? null : organizationId ? organizationId : undefined
    return this.directory.listUsers({
      organizationId: orgFilter,
      search,
      page: page ? Number(page) : 0,
      pageSize: pageSize ? Number(pageSize) : 50,
    })
  }
}
