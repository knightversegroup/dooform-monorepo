import { Entity, Column, OneToMany } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserRoleModel } from './user-role.model'

@Entity('roles')
export class RoleModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 50, unique: true, default: '' })
  name!: string

  @Column({ name: 'display_name', type: 'varchar', length: 100, default: '' })
  displayName!: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @OneToMany(() => UserRoleModel, (ur) => ur.role)
  userRoles!: UserRoleModel[]
}
