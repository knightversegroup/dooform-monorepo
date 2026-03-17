import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserModel } from './user.model'
import { RoleModel } from './role.model'

@Entity('user_roles')
export class UserRoleModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy!: string | null

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt!: Date

  @ManyToOne(() => UserModel, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserModel

  @ManyToOne(() => RoleModel, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleModel
}
