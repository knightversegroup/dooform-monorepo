import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

export type PermissionOverrideEffect = 'ALLOW' | 'DENY'

/**
 * Per-user permission override. Each row layers an ALLOW or DENY on top of the
 * permissions the user's role would grant. DENY wins over both ALLOW and role
 * grants — important so a compromised admin can be locked out without DB surgery.
 *
 * One row per (user_id, permission_key); flip `effect` to switch direction.
 * Audit information (who/when) lives alongside the row so it's always paired with
 * the data it's auditing — `audit_logs` also gets a structured event row for
 * cross-table queries.
 */
@Entity('user_permissions')
@Index('idx_user_permissions_user_key', ['userId', 'permissionKey'], { unique: true })
export class UserPermissionModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({ name: 'permission_key', type: 'varchar', length: 100 })
  permissionKey!: string

  @Column({ type: 'varchar', length: 10 })
  effect!: PermissionOverrideEffect

  @Column({ name: 'granted_by_user_id', type: 'uuid', nullable: true })
  grantedByUserId!: string | null
}
