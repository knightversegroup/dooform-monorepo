import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

/**
 * Structured condition expression evaluated against the request context at
 * permission-check time. v1 covers time bounds, action glob, IP allowlist, and
 * outcome filter — chosen as the 95% case for IAM-style conditions without
 * pulling in a full CEL parser. If `condition` is NULL the assignment is
 * unconditionally active.
 */
export interface AssignmentCondition {
  title?: string
  validBefore?: string // ISO timestamp
  validAfter?: string // ISO timestamp
  actionMatches?: string[] // glob patterns (e.g. "templates:*"); ANY match passes
  ipAllow?: string[] // CIDRs; request IP must match one (when ctx.ip is supplied)
  outcomeIn?: ('success' | 'failure')[]
}

/**
 * One user holds one or more roles. The unique compound index on
 * `(user_id, role_id)` prevents double-assignment of the same role to the
 * same user — re-granting updates the existing row instead.
 *
 * `granted_by_user_id` is nullable for system-seeded assignments (legacy
 * users migrated from `users.role`) and assignments granted by service
 * accounts.
 */
@Entity('role_assignments')
@Index('idx_role_assignments_user_role', ['userId', 'roleId'], { unique: true })
@Index('idx_role_assignments_user', ['userId'])
@Index('idx_role_assignments_role', ['roleId'])
export class RoleAssignmentModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string

  @Column({ name: 'granted_by_user_id', type: 'uuid', nullable: true })
  grantedByUserId!: string | null

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @Column({ name: 'condition', type: 'jsonb', nullable: true })
  condition!: AssignmentCondition | null
}
