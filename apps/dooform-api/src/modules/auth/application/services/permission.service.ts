import { randomUUID } from 'crypto'

import { BadRequestException, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserRole } from '../../../user/domain/enums/user.enum'

import { DEFAULT_GRANTS, PERMISSIONS, isValidPermissionKey } from '../../domain/permissions.catalog'
import { RolePermissionModel } from '../../infrastructure/persistence/typeorm/models/role-permission.model'

@Injectable()
export class PermissionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionService.name)
  private cache: Record<UserRole, Set<string>> = {
    [UserRole.USER]: new Set(),
    [UserRole.ORG_ADMIN]: new Set(),
    [UserRole.GLOBAL_ADMIN]: new Set(),
  }

  constructor(
    @InjectRepository(RolePermissionModel)
    private readonly rolePermissions: Repository<RolePermissionModel>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedDefaults()
    await this.reload()
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

  has(role: UserRole, key: string): boolean {
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
}
