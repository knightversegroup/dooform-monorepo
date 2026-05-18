import { randomUUID } from 'crypto'

import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { UserRole } from '../../../user/domain/enums/user.enum'

import { DEFAULT_GRANTS, PERMISSIONS, isValidPermissionKey } from '../../domain/permissions.catalog'
import { RolePermissionModel } from '../../infrastructure/persistence/typeorm/models/role-permission.model'
import {
  UserPermissionModel,
  type PermissionOverrideEffect,
} from '../../infrastructure/persistence/typeorm/models/user-permission.model'
import { RoleModel } from '../../infrastructure/persistence/typeorm/models/role.model'
import {
  RoleAssignmentModel,
  type AssignmentCondition,
} from '../../infrastructure/persistence/typeorm/models/role-assignment.model'

import { AuditLogService } from './audit-log.service'
import { evaluateCondition, type ConditionContext } from './condition-evaluator'

export interface PermissionPrincipal {
  userId: string
  role?: UserRole | string // legacy single-role field; optional under multi-role
  organizationId?: string | null
  email?: string | null
}

export interface UserOverride {
  permissionKey: string
  effect: PermissionOverrideEffect
  grantedByUserId: string | null
  createdAt: Date
}

export interface RoleDetail {
  id: string
  code: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: string[]
  assigneeCount: number
}

export interface AssignmentDetail {
  id: string
  userId: string
  roleId: string
  roleCode: string
  roleName: string
  grantedByUserId: string | null
  grantedAt: Date
  expiresAt: Date | null
  condition: AssignmentCondition | null
}

@Injectable()
export class PermissionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionService.name)

  // Legacy cache keyed by the system UserRole enum — kept for `has(role, key)`
  // callers and for back-compat lookups from JWTs that still carry a single role.
  private cache: Record<UserRole, Set<string>> = {
    [UserRole.USER]: new Set(),
    [UserRole.ORG_ADMIN]: new Set(),
    [UserRole.GLOBAL_ADMIN]: new Set(),
  }
  // userOverrides: per-user ALLOW/DENY entries (Phase-3-of-previous-effort).
  private userOverrides: Map<string, Map<string, PermissionOverrideEffect>> = new Map()
  // IAM caches — the new source of truth.
  private rolesByCode: Map<string, RoleModel> = new Map()
  private rolesById: Map<string, RoleModel> = new Map()
  private rolePermissions: Map<string, Set<string>> = new Map()
  private userAssignments: Map<string, RoleAssignmentModel[]> = new Map()

  constructor(
    @InjectRepository(RolePermissionModel)
    private readonly rolePermissionsRepo: Repository<RolePermissionModel>,
    @InjectRepository(UserPermissionModel)
    private readonly userPermissions: Repository<UserPermissionModel>,
    @InjectRepository(RoleModel)
    private readonly roles: Repository<RoleModel>,
    @InjectRepository(RoleAssignmentModel)
    private readonly assignments: Repository<RoleAssignmentModel>,
    @Inject(forwardRef(() => AuditLogService))
    private readonly auditLog: AuditLogService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults()
    await this.reload()
    await this.reloadUserOverrides()
    await this.reloadIam()
  }

  // ---------------------------------------------------------------------------
  // Seed / cache loaders
  // ---------------------------------------------------------------------------

  private async seedDefaults(): Promise<void> {
    for (const role of Object.values(UserRole)) {
      const existing = await this.rolePermissionsRepo.find({ where: { role } })
      const existingKeys = new Set(existing.map((r) => r.permissionKey))
      const desired = DEFAULT_GRANTS[role] ?? []

      if (existing.length === 0 && desired.length) {
        await this.rolePermissionsRepo.save(
          desired.map((key) =>
            this.rolePermissionsRepo.create({ id: randomUUID(), role, permissionKey: key }),
          ),
        )
        this.logger.log(`Seeded ${desired.length} permissions for ${role}`)
        continue
      }

      const newKeys = desired.filter((k) => !existingKeys.has(k))
      if (newKeys.length) {
        await this.rolePermissionsRepo.save(
          newKeys.map((key) =>
            this.rolePermissionsRepo.create({ id: randomUUID(), role, permissionKey: key }),
          ),
        )
        this.logger.log(`Backfilled ${newKeys.length} new permissions for ${role}`)
      }
    }
  }

  async reload(): Promise<void> {
    const rows = await this.rolePermissionsRepo.find()
    const next: Record<UserRole, Set<string>> = {
      [UserRole.USER]: new Set(),
      [UserRole.ORG_ADMIN]: new Set(),
      [UserRole.GLOBAL_ADMIN]: new Set(),
    }
    for (const r of rows) next[r.role].add(r.permissionKey)
    this.cache = next
  }

  async reloadUserOverrides(): Promise<void> {
    const rows = await this.userPermissions.find()
    const next = new Map<string, Map<string, PermissionOverrideEffect>>()
    for (const r of rows) {
      let m = next.get(r.userId)
      if (!m) {
        m = new Map()
        next.set(r.userId, m)
      }
      m.set(r.permissionKey, r.effect)
    }
    this.userOverrides = next
  }

  async reloadIam(): Promise<void> {
    // Roles
    const allRoles = await this.roles.find({ where: { deletedAt: IsNull() } })
    this.rolesByCode = new Map(allRoles.map((r) => [r.code, r]))
    this.rolesById = new Map(allRoles.map((r) => [r.id, r]))

    // role_id -> permission_key set
    const rolePerms = await this.rolePermissionsRepo.find()
    const byRoleId = new Map<string, Set<string>>()
    for (const rp of rolePerms) {
      // Prefer role_id (new path). Fallback to legacy role enum -> id resolution.
      let roleId = rp.roleId
      if (!roleId) {
        const role = this.rolesByCode.get(rp.role as unknown as string)
        roleId = role?.id ?? null
      }
      if (!roleId) continue
      let set = byRoleId.get(roleId)
      if (!set) {
        set = new Set()
        byRoleId.set(roleId, set)
      }
      set.add(rp.permissionKey)
    }
    this.rolePermissions = byRoleId

    // user_id -> assignments[]
    const allAssignments = await this.assignments.find()
    const byUser = new Map<string, RoleAssignmentModel[]>()
    for (const a of allAssignments) {
      const list = byUser.get(a.userId) ?? []
      list.push(a)
      byUser.set(a.userId, list)
    }
    this.userAssignments = byUser
  }

  // ---------------------------------------------------------------------------
  // Read APIs
  // ---------------------------------------------------------------------------

  /**
   * Legacy role-level check. Use {@link userHas} for any callsite that has a
   * user object — `has` cannot consider per-user overrides or per-user role
   * assignments and will silently miss them.
   */
  has(role: UserRole, key: string): boolean {
    if (role === UserRole.GLOBAL_ADMIN) return true
    return this.cache[role]?.has(key) ?? false
  }

  /**
   * Canonical permission check. Order of precedence:
   *  1. Per-user DENY override — wins over everything, including GLOBAL_ADMIN
   *     role grants. This lets an admin lock out a compromised account without
   *     DB surgery.
   *  2. Per-user ALLOW override — grants the permission regardless of roles.
   *  3. Union of permission keys across the user's currently-active role
   *     assignments (expired and condition-failing assignments are skipped).
   *  4. As a final fallback for callers that supply a legacy single role but
   *     no userId (e.g. seed scripts), fall back to the legacy role cache.
   */
  userHas(
    principal:
      | { userId?: string; role?: UserRole | string }
      | null
      | undefined,
    key: string,
    ctx: ConditionContext = {},
  ): boolean {
    if (!principal) return false

    const overrides = principal.userId ? this.userOverrides.get(principal.userId) : undefined
    const overrideEffect = overrides?.get(key)
    if (overrideEffect === 'DENY') return false
    if (overrideEffect === 'ALLOW') return true

    if (principal.userId) {
      const granted = this.unionPermissionsForUser(principal.userId, ctx)
      if (granted.has('*')) return true // GLOBAL_ADMIN sentinel handled in unionPermissionsForUser
      if (granted.has(key)) return true
    }

    // Fallback for legacy callers that only know the role string (e.g. internal
    // scripts that don't have a userId).
    if (principal.role) {
      if (principal.role === UserRole.GLOBAL_ADMIN) return true
      return this.cache[principal.role as UserRole]?.has(key) ?? false
    }

    return false
  }

  /**
   * Compute the effective permission set for a user.
   */
  effectivePermissions(
    principal: { userId: string; role?: UserRole | string },
    ctx: ConditionContext = {},
  ): string[] {
    const all = new Set<string>()
    const granted = this.unionPermissionsForUser(principal.userId, ctx)
    if (granted.has('*')) {
      for (const p of PERMISSIONS) all.add(p.key)
    } else {
      for (const k of granted) all.add(k)
    }
    // Apply overrides on top.
    const overrides = this.userOverrides.get(principal.userId)
    if (overrides) {
      for (const [key, effect] of overrides) {
        if (effect === 'ALLOW') all.add(key)
        else if (effect === 'DENY') all.delete(key)
      }
    }
    return Array.from(all).sort()
  }

  /**
   * Return the role *codes* a user holds right now (active assignments).
   * Used by the JWT payload, the audit-log "actor role" field, and the UI.
   */
  activeRoleCodes(userId: string, ctx: ConditionContext = {}): string[] {
    const assignments = this.userAssignments.get(userId) ?? []
    const codes = new Set<string>()
    const now = ctx.now ?? new Date()
    for (const a of assignments) {
      if (a.expiresAt && a.expiresAt <= now) continue
      if (!evaluateCondition(a.condition, ctx)) continue
      const role = this.rolesById.get(a.roleId)
      if (role) codes.add(role.code)
    }
    return Array.from(codes)
  }

  private unionPermissionsForUser(userId: string, ctx: ConditionContext): Set<string> {
    const assignments = this.userAssignments.get(userId) ?? []
    const out = new Set<string>()
    const now = ctx.now ?? new Date()
    for (const a of assignments) {
      if (a.expiresAt && a.expiresAt <= now) continue
      if (!evaluateCondition(a.condition, ctx)) continue
      const role = this.rolesById.get(a.roleId)
      if (!role) continue
      if (role.code === UserRole.GLOBAL_ADMIN) {
        out.add('*') // sentinel meaning "all permissions"
        continue
      }
      const perms = this.rolePermissions.get(a.roleId)
      if (perms) for (const k of perms) out.add(k)
    }
    return out
  }

  catalog() {
    return PERMISSIONS
  }

  grants(): Record<UserRole, string[]> {
    return {
      [UserRole.USER]: Array.from(this.cache[UserRole.USER]).sort(),
      [UserRole.ORG_ADMIN]: Array.from(this.cache[UserRole.ORG_ADMIN]).sort(),
      [UserRole.GLOBAL_ADMIN]: Array.from(this.cache[UserRole.GLOBAL_ADMIN]).sort(),
    }
  }

  async setGrant(role: UserRole, key: string, granted: boolean): Promise<void> {
    if (!isValidPermissionKey(key)) {
      throw new BadRequestException(`Unknown permission: ${key}`)
    }
    const existing = await this.rolePermissionsRepo.findOne({ where: { role, permissionKey: key } })
    if (granted && !existing) {
      const roleEntity = this.rolesByCode.get(role)
      await this.rolePermissionsRepo.save(
        this.rolePermissionsRepo.create({
          id: randomUUID(),
          role,
          roleId: roleEntity?.id ?? null,
          permissionKey: key,
        }),
      )
    } else if (!granted && existing) {
      await this.rolePermissionsRepo.delete({ id: existing.id })
    }
    await this.reload()
    await this.reloadIam()
  }

  async setGrantsBulk(role: UserRole, keys: string[]): Promise<void> {
    for (const key of keys) {
      if (!isValidPermissionKey(key)) {
        throw new BadRequestException(`Unknown permission: ${key}`)
      }
    }
    const roleEntity = this.rolesByCode.get(role)
    await this.rolePermissionsRepo.delete({ role })
    if (keys.length) {
      await this.rolePermissionsRepo.save(
        keys.map((key) =>
          this.rolePermissionsRepo.create({
            id: randomUUID(),
            role,
            roleId: roleEntity?.id ?? null,
            permissionKey: key,
          }),
        ),
      )
    }
    await this.reload()
    await this.reloadIam()
  }

  async listUserOverrides(userId: string): Promise<UserOverride[]> {
    const rows = await this.userPermissions.find({ where: { userId } })
    return rows.map((r) => ({
      permissionKey: r.permissionKey,
      effect: r.effect,
      grantedByUserId: r.grantedByUserId,
      createdAt: r.createdAt as unknown as Date,
    }))
  }

  async setUserOverride(
    targetUserId: string,
    key: string,
    effect: PermissionOverrideEffect | null,
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<void> {
    if (!isValidPermissionKey(key)) {
      throw new BadRequestException(`Unknown permission: ${key}`)
    }
    const existing = await this.userPermissions.findOne({
      where: { userId: targetUserId, permissionKey: key },
    })

    let action: string
    if (effect === null) {
      if (!existing) return
      await this.userPermissions.delete({ id: existing.id })
      action = 'user.permission.override.cleared'
    } else if (!existing) {
      await this.userPermissions.save(
        this.userPermissions.create({
          id: randomUUID(),
          userId: targetUserId,
          permissionKey: key,
          effect,
          grantedByUserId: actor.userId ?? null,
        }),
      )
      action = effect === 'ALLOW' ? 'user.permission.allowed' : 'user.permission.denied'
    } else if (existing.effect !== effect) {
      existing.effect = effect
      existing.grantedByUserId = actor.userId ?? null
      await this.userPermissions.save(existing)
      action = effect === 'ALLOW' ? 'user.permission.allowed' : 'user.permission.denied'
    } else {
      return
    }

    await this.reloadUserOverrides()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action,
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: {
        permissionKey: key,
        effect: effect ?? null,
        previousEffect: existing?.effect ?? null,
      },
    })
  }

  async replaceUserOverrides(
    targetUserId: string,
    overrides: Array<{ key: string; effect: PermissionOverrideEffect }>,
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<void> {
    for (const o of overrides) {
      if (!isValidPermissionKey(o.key)) {
        throw new BadRequestException(`Unknown permission: ${o.key}`)
      }
    }
    const existing = await this.userPermissions.find({ where: { userId: targetUserId } })
    const desired = new Map(overrides.map((o) => [o.key, o.effect]))
    const previous = new Map(existing.map((r) => [r.permissionKey, r.effect]))

    const allowed: string[] = []
    const denied: string[] = []
    const cleared: string[] = []

    for (const row of existing) {
      if (!desired.has(row.permissionKey)) {
        await this.userPermissions.delete({ id: row.id })
        cleared.push(row.permissionKey)
      }
    }

    for (const [key, effect] of desired) {
      const prev = previous.get(key)
      if (prev === effect) continue
      const row = existing.find((r) => r.permissionKey === key)
      if (row) {
        row.effect = effect
        row.grantedByUserId = actor.userId ?? null
        await this.userPermissions.save(row)
      } else {
        await this.userPermissions.save(
          this.userPermissions.create({
            id: randomUUID(),
            userId: targetUserId,
            permissionKey: key,
            effect,
            grantedByUserId: actor.userId ?? null,
          }),
        )
      }
      if (effect === 'ALLOW') allowed.push(key)
      else denied.push(key)
    }

    await this.reloadUserOverrides()

    if (allowed.length || denied.length || cleared.length) {
      this.auditLog.log({
        organizationId: actor.organizationId ?? null,
        actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
        action: 'user.permission.bulk.replaced',
        resourceType: 'user',
        resourceId: targetUserId,
        metadata: { allowed, denied, cleared },
      })
    }
  }

  // ---------------------------------------------------------------------------
  // IAM: roles
  // ---------------------------------------------------------------------------

  async listRoles(): Promise<RoleDetail[]> {
    const all = Array.from(this.rolesById.values()).sort((a, b) => {
      if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    const assigneeCounts = await this.assignments
      .createQueryBuilder('a')
      .select('a.role_id', 'roleId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.role_id')
      .getRawMany<{ roleId: string; count: string }>()
    const countByRoleId = new Map(assigneeCounts.map((row) => [row.roleId, Number(row.count)]))
    return all.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      permissions: Array.from(this.rolePermissions.get(r.id) ?? new Set<string>()).sort(),
      assigneeCount: countByRoleId.get(r.id) ?? 0,
    }))
  }

  async getRole(idOrCode: string): Promise<RoleDetail> {
    const role = this.rolesById.get(idOrCode) ?? this.rolesByCode.get(idOrCode)
    if (!role) throw new NotFoundException(`Role not found: ${idOrCode}`)
    const assigneeCount = await this.assignments.count({ where: { roleId: role.id } })
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: Array.from(this.rolePermissions.get(role.id) ?? new Set<string>()).sort(),
      assigneeCount,
    }
  }

  async createRole(
    input: { code: string; name: string; description?: string | null; permissions: string[] },
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<RoleDetail> {
    const code = input.code.trim()
    if (!/^[a-z][a-z0-9-]{1,63}$/.test(code)) {
      throw new BadRequestException(
        'Role code must be lowercase, start with a letter, and contain only letters, digits, and hyphens',
      )
    }
    if (this.rolesByCode.has(code)) {
      throw new BadRequestException(`Role code already in use: ${code}`)
    }
    for (const key of input.permissions) {
      if (!isValidPermissionKey(key)) {
        throw new BadRequestException(`Unknown permission: ${key}`)
      }
    }

    const role = this.roles.create({
      id: randomUUID(),
      code,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      isSystem: false,
    })
    await this.roles.save(role)
    if (input.permissions.length) {
      await this.rolePermissionsRepo.save(
        input.permissions.map((key) =>
          this.rolePermissionsRepo.create({
            id: randomUUID(),
            // legacy enum is required; pick USER as a harmless placeholder for
            // custom roles — readers prefer role_id when populated.
            role: UserRole.USER,
            roleId: role.id,
            permissionKey: key,
          }),
        ),
      )
    }
    await this.reload()
    await this.reloadIam()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'role.created',
      resourceType: 'role',
      resourceId: role.id,
      metadata: { code: role.code, name: role.name, permissions: input.permissions },
    })

    return this.getRole(role.id)
  }

  async updateRole(
    id: string,
    patch: { name?: string; description?: string | null; permissions?: string[] },
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<RoleDetail> {
    const role = this.rolesById.get(id)
    if (!role) throw new NotFoundException(`Role not found: ${id}`)

    const before = {
      name: role.name,
      description: role.description,
      permissions: Array.from(this.rolePermissions.get(role.id) ?? new Set<string>()).sort(),
    }

    if (patch.name !== undefined) {
      if (role.isSystem) {
        throw new BadRequestException('System role name cannot be changed')
      }
      role.name = patch.name.trim()
    }
    if (patch.description !== undefined) {
      role.description = patch.description?.trim() || null
    }
    await this.roles.save(role)

    if (patch.permissions !== undefined) {
      for (const key of patch.permissions) {
        if (!isValidPermissionKey(key)) {
          throw new BadRequestException(`Unknown permission: ${key}`)
        }
      }
      if (role.isSystem) {
        // System roles keep both the legacy enum and new role_id columns in sync.
        await this.rolePermissionsRepo.delete({ role: role.code as unknown as UserRole })
        if (patch.permissions.length) {
          await this.rolePermissionsRepo.save(
            patch.permissions.map((key) =>
              this.rolePermissionsRepo.create({
                id: randomUUID(),
                role: role.code as unknown as UserRole,
                roleId: role.id,
                permissionKey: key,
              }),
            ),
          )
        }
      } else {
        await this.rolePermissionsRepo.delete({ roleId: role.id })
        if (patch.permissions.length) {
          await this.rolePermissionsRepo.save(
            patch.permissions.map((key) =>
              this.rolePermissionsRepo.create({
                id: randomUUID(),
                role: UserRole.USER,
                roleId: role.id,
                permissionKey: key,
              }),
            ),
          )
        }
      }
    }

    await this.reload()
    await this.reloadIam()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'role.updated',
      resourceType: 'role',
      resourceId: role.id,
      metadata: {
        before,
        after: {
          name: role.name,
          description: role.description,
          permissions: patch.permissions ?? before.permissions,
        },
      },
    })

    return this.getRole(role.id)
  }

  async deleteRole(
    id: string,
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<void> {
    const role = this.rolesById.get(id)
    if (!role) throw new NotFoundException(`Role not found: ${id}`)
    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted')
    }
    const assignments = await this.assignments.count({ where: { roleId: id } })
    if (assignments > 0) {
      throw new BadRequestException(
        `Cannot delete role with ${assignments} active assignment(s) — revoke them first`,
      )
    }
    await this.rolePermissionsRepo.delete({ roleId: id })
    await this.roles.softDelete({ id })
    await this.reload()
    await this.reloadIam()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'role.deleted',
      resourceType: 'role',
      resourceId: role.id,
      metadata: { code: role.code, name: role.name },
    })
  }

  // ---------------------------------------------------------------------------
  // IAM: assignments
  // ---------------------------------------------------------------------------

  async listUserAssignments(userId: string): Promise<AssignmentDetail[]> {
    const rows = await this.assignments.find({ where: { userId }, order: { createdAt: 'DESC' } })
    return rows.map((a) => {
      const role = this.rolesById.get(a.roleId)
      return {
        id: a.id,
        userId: a.userId,
        roleId: a.roleId,
        roleCode: role?.code ?? '',
        roleName: role?.name ?? '',
        grantedByUserId: a.grantedByUserId,
        grantedAt: a.createdAt as unknown as Date,
        expiresAt: a.expiresAt,
        condition: a.condition,
      }
    })
  }

  async assignRole(
    userId: string,
    roleId: string,
    actor: PermissionPrincipal & { organizationId?: string | null },
    opts?: { expiresAt?: Date | null; condition?: AssignmentCondition | null },
  ): Promise<AssignmentDetail> {
    const role = this.rolesById.get(roleId)
    if (!role) throw new NotFoundException(`Role not found: ${roleId}`)

    // Grants of GLOBAL_ADMIN are reserved for callers who hold
    // users:assign-global-admin. Other escalations are gated by the route guard.
    if (role.code === UserRole.GLOBAL_ADMIN) {
      const canPromote = this.userHas(actor, 'users:assign-global-admin')
      if (!canPromote) {
        throw new ForbiddenException(
          'Missing users:assign-global-admin permission to grant the GLOBAL_ADMIN role',
        )
      }
    }

    const existing = await this.assignments.findOne({ where: { userId, roleId } })
    if (existing) {
      existing.expiresAt = opts?.expiresAt ?? existing.expiresAt
      existing.condition = opts?.condition ?? existing.condition
      existing.grantedByUserId = actor.userId ?? existing.grantedByUserId
      await this.assignments.save(existing)
    } else {
      await this.assignments.save(
        this.assignments.create({
          id: randomUUID(),
          userId,
          roleId,
          grantedByUserId: actor.userId ?? null,
          expiresAt: opts?.expiresAt ?? null,
          condition: opts?.condition ?? null,
        }),
      )
    }
    await this.reloadIam()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'user.role.assigned',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        roleId,
        roleCode: role.code,
        expiresAt: opts?.expiresAt ?? null,
        condition: opts?.condition ?? null,
      },
    })

    const fresh = await this.assignments.findOne({ where: { userId, roleId } })
    if (!fresh) throw new NotFoundException('Assignment vanished mid-write')
    return {
      id: fresh.id,
      userId: fresh.userId,
      roleId: fresh.roleId,
      roleCode: role.code,
      roleName: role.name,
      grantedByUserId: fresh.grantedByUserId,
      grantedAt: fresh.createdAt as unknown as Date,
      expiresAt: fresh.expiresAt,
      condition: fresh.condition,
    }
  }

  async revokeRole(
    userId: string,
    roleId: string,
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<void> {
    const role = this.rolesById.get(roleId)
    if (!role) throw new NotFoundException(`Role not found: ${roleId}`)
    const existing = await this.assignments.findOne({ where: { userId, roleId } })
    if (!existing) return
    if (userId === actor.userId && role.code === UserRole.GLOBAL_ADMIN) {
      throw new BadRequestException('Cannot revoke your own GLOBAL_ADMIN role')
    }
    await this.assignments.delete({ id: existing.id })
    await this.reloadIam()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'user.role.revoked',
      resourceType: 'user',
      resourceId: userId,
      metadata: { roleId, roleCode: role.code },
    })
  }

  async updateAssignment(
    assignmentId: string,
    patch: { expiresAt?: Date | null; condition?: AssignmentCondition | null },
    actor: PermissionPrincipal & { organizationId?: string | null },
  ): Promise<AssignmentDetail> {
    const existing = await this.assignments.findOne({ where: { id: assignmentId } })
    if (!existing) throw new NotFoundException(`Assignment not found: ${assignmentId}`)
    const before = { expiresAt: existing.expiresAt, condition: existing.condition }
    if (patch.expiresAt !== undefined) existing.expiresAt = patch.expiresAt
    if (patch.condition !== undefined) existing.condition = patch.condition
    await this.assignments.save(existing)
    await this.reloadIam()

    const role = this.rolesById.get(existing.roleId)
    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'user.role.assignment.updated',
      resourceType: 'user',
      resourceId: existing.userId,
      metadata: {
        assignmentId,
        roleId: existing.roleId,
        roleCode: role?.code ?? null,
        before,
        after: { expiresAt: existing.expiresAt, condition: existing.condition },
      },
    })

    return {
      id: existing.id,
      userId: existing.userId,
      roleId: existing.roleId,
      roleCode: role?.code ?? '',
      roleName: role?.name ?? '',
      grantedByUserId: existing.grantedByUserId,
      grantedAt: existing.createdAt as unknown as Date,
      expiresAt: existing.expiresAt,
      condition: existing.condition,
    }
  }
}
