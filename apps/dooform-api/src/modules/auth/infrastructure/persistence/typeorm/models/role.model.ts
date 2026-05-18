import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

/**
 * IAM-style role: a named bundle of permissions. System roles (USER, ORG_ADMIN,
 * GLOBAL_ADMIN) are seeded and cannot be deleted or have their `code` changed
 * — only their permission set is editable. Custom roles are admin-defined and
 * fully mutable.
 *
 * `code` is the stable identifier used by JWT claims and audit logs; `name` is
 * the human-facing label that can be renamed without breaking anything.
 */
@Entity('roles')
@Index('idx_roles_code', ['code'], { unique: true, where: 'deleted_at IS NULL' })
export class RoleModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 64 })
  code!: string

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null
}
