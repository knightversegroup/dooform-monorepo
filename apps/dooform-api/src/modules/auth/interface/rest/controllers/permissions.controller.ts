import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IsArray, IsEnum, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

import { PermissionService } from '../../../application/services/permission.service'
import { AuditLogService } from '../../../application/services/audit-log.service'
import { UserRole } from '../../../../user/domain/enums/user.enum'
import { UserModel } from '../../../../workflow/infrastructure/persistence/typeorm/models/user.model'

import { CurrentUser } from '../decorators/current-user.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'
import type { AuthenticatedUser } from '../types/authenticated-user'

class UpdateRoleGrantsDto {
  @IsArray()
  @IsString({ each: true })
  permissions!: string[]
}

class UserOverrideEntryDto {
  @IsString()
  key!: string

  @IsIn(['ALLOW', 'DENY'])
  effect!: 'ALLOW' | 'DENY'
}

class ReplaceUserOverridesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserOverrideEntryDto)
  overrides!: UserOverrideEntryDto[]
}

class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole

  @IsOptional()
  @IsString()
  reason?: string
}

@ApiTags('admin / permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(
    private readonly permissions: PermissionService,
    private readonly auditLog: AuditLogService,
    @InjectRepository(UserModel)
    private readonly users: Repository<UserModel>,
  ) {}

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

  // ---- Per-user assignment (Azure-AD-style) -----------------------------------

  @Get('users/:userId')
  @RequirePermission('users:override-permissions')
  async getUserPermissions(@Param('userId') userId: string) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    const overrides = await this.permissions.listUserOverrides(userId)
    const effective = this.permissions.effectivePermissions({ userId, role: target.role })
    return {
      userId: target.id,
      email: target.email,
      displayName: target.displayName,
      role: target.role,
      effectivePermissions: effective,
      overrides,
    }
  }

  @Put('users/:userId/overrides')
  @RequirePermission('users:override-permissions')
  async replaceUserOverrides(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: ReplaceUserOverridesDto,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    await this.permissions.replaceUserOverrides(
      userId,
      dto.overrides.map((o) => ({ key: o.key, effect: o.effect })),
      {
        userId: actor.userId,
        role: actor.role,
        email: actor.email,
        organizationId: actor.organizationId,
      },
    )
    return {
      ok: true,
      overrides: await this.permissions.listUserOverrides(userId),
      effectivePermissions: this.permissions.effectivePermissions({
        userId,
        role: target.role,
      }),
    }
  }

  @Patch('users/:userId/role')
  @RequirePermission('users:assign-role')
  async updateUserRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')

    // Promoting to GLOBAL_ADMIN is a hard floor: only callers with the explicit
    // promotion permission may do it, even if they have users:assign-role.
    if (dto.role === UserRole.GLOBAL_ADMIN) {
      const canPromoteGlobal = this.permissions.userHas(actor, 'users:assign-global-admin')
      if (!canPromoteGlobal) {
        throw new BadRequestException('Missing users:assign-global-admin permission')
      }
    }

    if (target.id === actor.userId && dto.role !== target.role) {
      throw new BadRequestException('Cannot change your own role')
    }

    const previousRole = target.role
    if (previousRole === dto.role) {
      return { ok: true, role: previousRole, changed: false }
    }
    target.role = dto.role
    await this.users.save(target)

    this.auditLog.log({
      organizationId: actor.organizationId,
      actor: { userId: actor.userId, email: actor.email, role: actor.role },
      action: 'user.role.changed',
      resourceType: 'user',
      resourceId: target.id,
      metadata: { from: previousRole, to: dto.role, email: target.email, reason: dto.reason },
    })

    return { ok: true, role: target.role, previousRole, changed: true }
  }
}
