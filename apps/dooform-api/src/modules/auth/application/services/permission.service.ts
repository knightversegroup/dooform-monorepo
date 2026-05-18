import { randomUUID } from 'crypto'

import { BadRequestException, forwardRef, Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserRole } from '../../../user/domain/enums/user.enum'

import { DEFAULT_GRANTS, PERMISSIONS, isValidPermissionKey } from '../../domain/permissions.catalog'
import { RolePermissionModel } from '../../infrastructure/persistence/typeorm/models/role-permission.model'
import {
  UserPermissionModel,
  type PermissionOverrideEffect,
} from '../../infrastructure/persistence/typeorm/models/user-permission.model'
import { AuditLogService } from './audit-log.service'

export interface PermissionPrincipal {
  userId: string
  role: UserRole
  organizationId?: string | null
  email?: string | null
}

export interface UserOverride {
  permissionKey: string
  effect: PermissionOverrideEffect
  grantedByUserId: string | null
  createdAt: Date
}

@Injectable()
export class PermissionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionService.name)
  private cache: Record<UserRole, Set<string>> = {
    [UserRole.USER]: new Set(),
    [UserRole.ORG_ADMIN]: new Set(),
    [UserRole.GLOBAL_ADMIN]: new Set(),
  }
  // Per-user override cache: userId -> permissionKey -> effect.
  // Kept in memory because permission checks are on the critical path of every
  // gated request; only users with overrides are present, so the map stays small.
  private userOverrides: Map<string, Map<string, PermissionOverrideEffect>> = new Map()

  constructor(
    @InjectRepository(RolePermissionModel)
    private readonly rolePermissions: Repository<RolePermissionModel>,
    @InjectRepository(UserPermissionModel)
    private readonly userPermissions: Repository<UserPermissionModel>,
    // forwardRef because AuditLogService can be invoked from many places; this
    // keeps DI happy if a future change makes audit-log depend on permissions.
    @Inject(forwardRef(() => AuditLogService))
    private readonly auditLog: AuditLogService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults()
    await this.reload()
    await this.reloadUserOverrides()
  }

  private async seedDefaults(): Promise<void> {
    for (const role of Object.values(UserRole)) {
      const existing = await this.rolePermissions.find({ where: { role } })
      const existingKeys = new Set(existing.map((r) => r.permissionKey))
      const desired = DEFAULT_GRANTS[role] ?? []

      // First-time seed: insert all defaults.
      if (existing.length === 0 && desired.length) {
        await this.rolePermissions.save(
          desired.map((key) =>
            this.rolePermissions.create({ id: randomUUID(), role, permissionKey: key }),
          ),
        )
        this.logger.log(`Seeded ${desired.length} permissions for ${role}`)
        continue
      }

      // Subsequent boots: backfill any permissions added to DEFAULT_GRANTS after this
      // role was first seeded. Apply to every role so newly-shipped features (e.g.
      // organization:audit:read for ORG_ADMIN) become accessible without an admin
      // manually toggling them. We only ever add — never auto-remove — so any toggle-offs
      // an admin made in /settings/permissions are preserved.
      const newKeys = desired.filter((k) => !existingKeys.has(k))
      if (newKeys.length) {
        await this.rolePermissions.save(
          newKeys.map((key) =>
            this.rolePermissions.create({ id: randomUUID(), role, permissionKey: key }),
          ),
        )
        this.logger.log(`Backfilled ${newKeys.length} new permissions for ${role}`)
      }
    }
  }

  async reload(): Promise<void> {
    const rows = await this.rolePermissions.find()
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

  /**
   * Role-level check. Use {@link userHas} for any callsite that has a user object —
   * `has` cannot consider per-user overrides and so will silently miss DENY rows.
   * Kept for backward compatibility and for paths that genuinely only know the role
   * (e.g. seeding scripts).
   */
  has(role: UserRole, key: string): boolean {
    if (role === UserRole.GLOBAL_ADMIN) return true
    return this.cache[role]?.has(key) ?? false
  }

  /**
   * Canonical permission check. DENY overrides win over both ALLOW overrides and role
   * grants so a compromised admin can be cut off without a DB migration. ALLOW
   * overrides escalate beyond what the role would grant. Otherwise the role's
   * baseline applies.
   */
  userHas(principal: { userId?: string; role: UserRole | string } | null | undefined, key: string): boolean {
    if (!principal) return false
    const role = principal.role as UserRole
    const overrides = principal.userId ? this.userOverrides.get(principal.userId) : undefined
    const effect = overrides?.get(key)
    if (effect === 'DENY') return false
    if (effect === 'ALLOW') return true
    // No override — fall through to role grants. GLOBAL_ADMIN still bypasses (subject
    // to the DENY check above).
    if (role === UserRole.GLOBAL_ADMIN) return true
    return this.cache[role]?.has(key) ?? false
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
    const existing = await this.rolePermissions.findOne({ where: { role, permissionKey: key } })
    if (granted && !existing) {
      await this.rolePermissions.save(
        this.rolePermissions.create({ id: randomUUID(), role, permissionKey: key }),
      )
    } else if (!granted && existing) {
      await this.rolePermissions.delete({ id: existing.id })
    }
    await this.reload()
  }

  async setGrantsBulk(role: UserRole, keys: string[]): Promise<void> {
    for (const key of keys) {
      if (!isValidPermissionKey(key)) {
        throw new BadRequestException(`Unknown permission: ${key}`)
      }
    }
    await this.rolePermissions.delete({ role })
    if (keys.length) {
      await this.rolePermissions.save(
        keys.map((key) =>
          this.rolePermissions.create({ id: randomUUID(), role, permissionKey: key }),
        ),
      )
    }
    await this.reload()
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

  /**
   * Compute the effective permission set for a user — what `userHas` would return
   * `true` for if asked. Useful for the admin UI's tri-state checkboxes.
   */
  effectivePermissions(principal: { userId: string; role: UserRole }): string[] {
    const all = new Set<string>()
    if (principal.role === UserRole.GLOBAL_ADMIN) {
      for (const p of PERMISSIONS) all.add(p.key)
    } else {
      for (const k of this.cache[principal.role] ?? new Set<string>()) all.add(k)
    }
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
   * Upsert a single override and audit-log the change. Passing `null` for effect
   * removes the override (returning to role-default).
   */
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
      return // no-op
    }

    await this.reloadUserOverrides()

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role },
      action,
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: { permissionKey: key, effect: effect ?? null, previousEffect: existing?.effect ?? null },
    })
  }

  /**
   * Replace a user's entire override set atomically. Emits one audit-log event per
   * delta (allowed, denied, cleared) so the admin trail shows exactly what changed.
   */
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

    // Removals: in DB but not in desired set.
    for (const row of existing) {
      if (!desired.has(row.permissionKey)) {
        await this.userPermissions.delete({ id: row.id })
        cleared.push(row.permissionKey)
      }
    }

    // Additions / updates.
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
        actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role },
        action: 'user.permission.bulk.replaced',
        resourceType: 'user',
        resourceId: targetUserId,
        metadata: { allowed, denied, cleared },
      })
    }
  }
}
