import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserRole } from '../../../../../user/domain/enums/user.enum'

/**
 * Junction table mapping a role to a permission key.
 *
 * Currently carries both `role` (legacy enum, kept while system roles are
 * dual-written) and `role_id` (the new FK into the `roles` table). The IAM
 * bootstrap migration backfills `role_id` for every existing row. Phase 5
 * drops the legacy `role` column once every reader has migrated.
 */
@Entity('role_permissions')
@Index('idx_role_permissions_role_key', ['role', 'permissionKey'], { unique: true })
@Index('idx_role_permissions_role_id_key', ['roleId', 'permissionKey'], {
  unique: true,
  where: 'role_id IS NOT NULL',
})
export class RolePermissionModel extends BaseTypeOrmModel {
  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null

  @Column({ name: 'permission_key', type: 'varchar', length: 100 })
  permissionKey!: string
}
