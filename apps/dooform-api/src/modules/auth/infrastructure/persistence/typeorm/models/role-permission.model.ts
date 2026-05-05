import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserRole } from '../../../../../user/domain/enums/user.enum'

@Entity('role_permissions')
@Index('idx_role_permissions_role_key', ['role', 'permissionKey'], { unique: true })
export class RolePermissionModel extends BaseTypeOrmModel {
  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole

  @Column({ name: 'permission_key', type: 'varchar', length: 100 })
  permissionKey!: string
}
