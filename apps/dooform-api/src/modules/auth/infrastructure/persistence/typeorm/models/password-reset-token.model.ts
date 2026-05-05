import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('password_reset_tokens')
@Index('idx_password_reset_tokens_user', ['userId'])
export class PasswordResetTokenModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null
}
