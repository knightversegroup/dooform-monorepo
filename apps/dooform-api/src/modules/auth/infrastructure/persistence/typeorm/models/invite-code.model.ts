import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('invite_codes')
@Index('idx_invite_codes_code', ['code'], { unique: true })
@Index('idx_invite_codes_organization', ['organizationId'])
export class InviteCodeModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 32 })
  code!: string

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null

  @Column({ name: 'used_by_user_id', type: 'uuid', nullable: true })
  usedByUserId!: string | null
}
