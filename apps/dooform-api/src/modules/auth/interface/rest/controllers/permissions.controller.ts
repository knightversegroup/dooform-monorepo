import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  IsArray,
  IsEnum,
  IsIn,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

import { PermissionService } from '../../../application/services/permission.service'
import { AuditLogService } from '../../../application/services/audit-log.service'
import { UserRole } from '../../../../user/domain/enums/user.enum'
import { UserModel } from '../../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import type { AssignmentCondition } from '../../../infrastructure/persistence/typeorm/models/role-assignment.model'

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

class CreateRoleDto {
  @IsString()
  code!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsArray()
  @IsString({ each: true })
  permissions!: string[]
}

class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]
}

class AssignmentConditionDto {
  @IsOptional() @IsString() title?: string
  @IsOptional() @IsISO8601() validBefore?: string
  @IsOptional() @IsISO8601() validAfter?: string
  @IsOptional() @IsArray() @IsString({ each: true }) actionMatches?: string[]
  @IsOptional() @IsArray() @IsString({ each: true }) ipAllow?: string[]
  @IsOptional() @IsArray() @IsIn(['success', 'failure'], { each: true }) outcomeIn?: ('success' | 'failure')[]
}

class CreateAssignmentDto {
  @IsString()
  roleId!: string

  @IsOptional()
  @IsISO8601()
  expiresAt?: string

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AssignmentConditionDto)
  condition?: AssignmentConditionDto
}

class UpdateAssignmentDto {
  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AssignmentConditionDto)
  condition?: AssignmentConditionDto | null
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
    // Mirror the legacy role write into role_assignments so the IAM page and
    // permission checks reflect this change immediately.
    await this.permissions.setPrimarySystemRole(target.id, dto.role, {
      userId: actor.userId,
      role: actor.role,
      email: actor.email,
      organizationId: actor.organizationId,
    })

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

  // ---- IAM: roles (system + custom) -----------------------------------------

  @Get('roles')
  @RequirePermission('roles:read')
  async listRoles() {
    return this.permissions.listRoles()
  }

  @Get('roles/:id')
  @RequirePermission('roles:read')
  async getRole(@Param('id') id: string) {
    return this.permissions.getRole(id)
  }

  @Post('roles')
  @RequirePermission('roles:create')
  async createRole(@CurrentUser() actor: AuthenticatedUser, @Body() dto: CreateRoleDto) {
    return this.permissions.createRole(
      {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        permissions: dto.permissions,
      },
      { userId: actor.userId, role: actor.role, email: actor.email, organizationId: actor.organizationId },
    )
  }

  @Patch('roles/:id')
  @RequirePermission('roles:update')
  async updateRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.permissions.updateRole(
      id,
      {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
      },
      { userId: actor.userId, role: actor.role, email: actor.email, organizationId: actor.organizationId },
    )
  }

  @Delete('roles/:id')
  @RequirePermission('roles:delete')
  async deleteRole(@CurrentUser() actor: AuthenticatedUser, @Param('id') id: string) {
    await this.permissions.deleteRole(id, {
      userId: actor.userId,
      role: actor.role,
      email: actor.email,
      organizationId: actor.organizationId,
    })
    return { ok: true }
  }

  // ---- IAM: per-user assignments --------------------------------------------

  @Get('users/:userId/assignments')
  @RequirePermission('users:assign-role')
  async listAssignments(@Param('userId') userId: string) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    return this.permissions.listUserAssignments(userId)
  }

  @Post('users/:userId/assignments')
  @RequirePermission('users:assign-role')
  async createAssignment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    return this.permissions.assignRole(
      userId,
      dto.roleId,
      { userId: actor.userId, role: actor.role, email: actor.email, organizationId: actor.organizationId },
      {
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        condition: (dto.condition as AssignmentCondition) ?? null,
      },
    )
  }

  @Delete('users/:userId/assignments/:assignmentId')
  @RequirePermission('users:assign-role')
  async revokeAssignment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    const assignments = await this.permissions.listUserAssignments(userId)
    const found = assignments.find((a) => a.id === assignmentId)
    if (!found) throw new NotFoundException('Assignment not found for user')
    await this.permissions.revokeRole(userId, found.roleId, {
      userId: actor.userId,
      role: actor.role,
      email: actor.email,
      organizationId: actor.organizationId,
    })
    return { ok: true }
  }

  @Post('users/:userId/reset')
  @RequirePermission('users:override-permissions')
  async resetUserIam(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    return this.permissions.resetUserIam(userId, {
      userId: actor.userId,
      role: actor.role,
      email: actor.email,
      organizationId: actor.organizationId,
    })
  }

  @Patch('users/:userId/assignments/:assignmentId')
  @RequirePermission('users:assign-role')
  async patchAssignment(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    const target = await this.users.findOne({ where: { id: userId } })
    if (!target) throw new NotFoundException('User not found')
    return this.permissions.updateAssignment(
      assignmentId,
      {
        expiresAt:
          dto.expiresAt === null ? null : dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        condition: dto.condition === null ? null : ((dto.condition as AssignmentCondition) ?? undefined),
      },
      { userId: actor.userId, role: actor.role, email: actor.email, organizationId: actor.organizationId },
    )
  }
}
