import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserModel } from './user.model'

@Entity('refresh_tokens')
export class RefreshTokenModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ type: 'varchar', length: 512, nullable: true })
  token!: string | null

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked!: boolean

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserModel
}
