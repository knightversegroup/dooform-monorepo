import { Entity, Column, OneToMany, OneToOne } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserRoleModel } from './user-role.model'
import { UserQuotaModel } from './user-quota.model'

@Entity('users')
export class UserModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email!: string | null

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password!: string | null

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName!: string | null

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null

  @Column({ name: 'display_name', type: 'varchar', length: 100, nullable: true })
  displayName!: string | null

  @Column({ name: 'picture_url', type: 'varchar', length: 512, nullable: true })
  pictureUrl!: string | null

  @Column({ name: 'picture_object_name', type: 'varchar', length: 512, nullable: true })
  pictureObjectName!: string | null

  @Column({ name: 'line_user_id', type: 'varchar', length: 100, nullable: true, unique: true })
  lineUserId!: string | null

  @Column({ name: 'google_id', type: 'varchar', length: 100, nullable: true, unique: true })
  googleId!: string | null

  @Column({ name: 'auth_provider', type: 'varchar', length: 20, default: 'email' })
  authProvider!: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Column({ name: 'profile_completed', type: 'boolean', default: false })
  profileCompleted!: boolean

  @OneToMany(() => UserRoleModel, (ur) => ur.user, { eager: false })
  userRoles!: UserRoleModel[]

  @OneToOne(() => UserQuotaModel, (q) => q.user, { eager: false })
  quota!: UserQuotaModel | null
}
