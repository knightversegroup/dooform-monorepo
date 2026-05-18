import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { AuditLogService } from '../../../application/services/audit-log.service'
import { PermissionService } from '../../../application/services/permission.service'

import { CurrentUser } from '../decorators/current-user.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../types/authenticated-user'

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(
    private readonly audit: AuditLogService,
    private readonly permissions: PermissionService,
  ) {}

  // Holders of `audit-logs:read-cross-org` may pass ?organizationId= to narrow to a
  // specific tenant or omit it to view every tenant. Everyone else is hard-scoped to
  // their own org by the service layer.
  @Get()
  @RequirePermission('organization:audit:read')
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('organizationId') organizationId?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('outcome') outcome?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const canReadCrossOrg = this.permissions.userHas(user, 'audit-logs:read-cross-org')
    const scope = canReadCrossOrg ? organizationId ?? null : user.organizationId
    const result = await this.audit.list({
      scopeOrganizationId: scope ?? null,
      callerRole: user.role,
      canReadCrossOrg,
      actorUserId,
      action,
      resourceType,
      resourceId,
      outcome,
      fromDate: from ? new Date(from) : undefined,
      toDate: to ? new Date(to) : undefined,
      page: page ? Math.max(0, Number(page)) : 0,
      pageSize: pageSize ? Math.min(200, Math.max(1, Number(pageSize))) : 50,
    })
    return result
  }
}
