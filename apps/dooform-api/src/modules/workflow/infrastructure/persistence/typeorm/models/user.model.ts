import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserRole } from '../../../../../user/domain/enums/user.enum'
import { UserTier } from '../../../../../document/domain/enums/document.enum'

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_organization', ['organizationId'])
@Index('idx_users_google', ['googleId'], { unique: true, where: 'google_id IS NOT NULL' })
export class UserModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName!: string

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole

  // Stored as varchar (not pg enum) so we can add tier codes via the tier_configs
  // table without an enum-alter migration. The TS-side enum is just for callers.
  @Column({ name: 'user_tier', type: 'varchar', length: 32, default: UserTier.FREE })
  userTier!: UserTier

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true })
  googleId!: string | null

  @Column({ name: 'onboarded_at', type: 'timestamptz', nullable: true })
  onboardedAt!: Date | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone!: string | null

  @Column({ type: 'varchar', length: 16, nullable: true })
  locale!: string | null

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle!: string | null

  /**
   * Soft-disable flag. Inactive users can't log in and their refresh tokens
   * are revoked when the flag flips false. The row itself is preserved so
   * audit logs, document ownership, and historical references remain intact.
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean
}
