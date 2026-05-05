import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('refresh_tokens')
@Index('idx_refresh_tokens_user', ['userId'])
export class RefreshTokenModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null

  @Column({ name: 'replaced_by_token_id', type: 'uuid', nullable: true })
  replacedByTokenId!: string | null

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip!: string | null
}
