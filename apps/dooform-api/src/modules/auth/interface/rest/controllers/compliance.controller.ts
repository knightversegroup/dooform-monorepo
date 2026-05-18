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
import { IsArray, IsBoolean, IsEnum, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator'

import { ComplianceService } from '../../../application/services/compliance.service'
import { PermissionService } from '../../../application/services/permission.service'
import type {
  ComplianceRuleConditions,
  ComplianceSeverity,
} from '../../../infrastructure/persistence/typeorm/models/compliance-rule.model'

import { CurrentUser } from '../decorators/current-user.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { SkipAudit } from '../decorators/audit.decorators'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../types/authenticated-user'

class ConditionsDto {
  @IsString()
  actionPattern!: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metadataKeywords?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actorRoles?: string[]

  @IsOptional()
  @IsIn(['success', 'failure', 'any'])
  outcome?: 'success' | 'failure' | 'any'

  @IsOptional()
  @IsString()
  resourceType?: string
}

class CreateRuleDto {
  @IsString()
  @MaxLength(255)
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsObject()
  conditions!: ComplianceRuleConditions

  @IsOptional()
  @IsEnum(['INFO', 'WARN', 'CRITICAL'] as unknown as object)
  severity?: ComplianceSeverity

  @IsOptional()
  @IsBoolean()
  enabled?: boolean

  @IsOptional()
  @IsString()
  notifyEmails?: string

  // Only honored if caller is GLOBAL_ADMIN — pass `null` to create a platform-wide rule.
  @IsOptional()
  scope?: 'global' | 'tenant'
}

class UpdateRuleDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsObject() conditions?: ComplianceRuleConditions
  @IsOptional() severity?: ComplianceSeverity
  @IsOptional() @IsBoolean() enabled?: boolean
  @IsOptional() @IsString() notifyEmails?: string
}

@ApiTags('compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@SkipAudit()
export class ComplianceController {
  constructor(
    private readonly compliance: ComplianceService,
    private readonly permissions: PermissionService,
  ) {}

  // ---- Rules ----

  @Get('rules')
  @RequirePermission('organization:audit:read')
  async listRules(@CurrentUser() user: AuthenticatedUser) {
    return this.compliance.listRules({
      organizationId: user.organizationId,
      callerRole: user.role,
      callerUserId: user.userId,
    })
  }

  @Post('rules')
  @RequirePermission('organization:audit:manage')
  async createRule(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRuleDto) {
    const canManageGlobal = this.permissions.userHas(user, 'compliance:rules:manage-global')
    const orgId = canManageGlobal && dto.scope === 'global' ? null : user.organizationId
    return this.compliance.createRule(
      {
        organizationId: orgId,
        name: dto.name,
        description: dto.description ?? null,
        conditions: dto.conditions,
        severity: dto.severity,
        enabled: dto.enabled,
        notifyEmails: dto.notifyEmails ?? null,
        createdByUserId: user.userId,
      },
      { userId: user.userId, role: user.role },
    )
  }

  @Patch('rules/:id')
  @RequirePermission('organization:audit:manage')
  async updateRule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.compliance.updateRule(
      id,
      {
        name: dto.name,
        description: dto.description ?? null,
        conditions: dto.conditions,
        severity: dto.severity,
        enabled: dto.enabled,
        notifyEmails: dto.notifyEmails ?? null,
      },
      { userId: user.userId, organizationId: user.organizationId, role: user.role },
    )
  }

  @Delete('rules/:id')
  @RequirePermission('organization:audit:manage')
  async deleteRule(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.compliance.deleteRule(id, {
      userId: user.userId,
      organizationId: user.organizationId,
      role: user.role,
    })
    return { ok: true }
  }

  // ---- Alerts ----

  @Get('alerts')
  @RequirePermission('organization:audit:read')
  async listAlerts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('organizationId') organizationId?: string,
    @Query('acknowledged') acknowledged?: string,
    @Query('severity') severity?: ComplianceSeverity,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const canReadCrossOrg = this.permissions.userHas(user, 'audit-logs:read-cross-org')
    const scope = canReadCrossOrg ? organizationId ?? null : user.organizationId
    const ack =
      acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined
    return this.compliance.listAlerts({
      scopeOrganizationId: scope ?? null,
      callerRole: user.role,
      canReadCrossOrg,
      acknowledged: ack,
      severity,
      page: page ? Math.max(0, Number(page)) : 0,
      pageSize: pageSize ? Math.min(200, Math.max(1, Number(pageSize))) : 50,
    })
  }

  @Post('alerts/:id/acknowledge')
  @RequirePermission('organization:audit:read')
  async acknowledge(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.compliance.acknowledge(id, {
      userId: user.userId,
      organizationId: user.organizationId,
      role: user.role,
    })
  }

  @Get('alerts/unread-count')
  @RequirePermission('organization:audit:read')
  async unreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.compliance.unreadCount({
      organizationId: user.organizationId,
      callerRole: user.role,
      callerUserId: user.userId,
    })
    return { count }
  }
}
