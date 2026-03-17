import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserModel } from './user.model'

@Entity('user_quotas')
export class UserQuotaModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ name: 'total_quota', type: 'int', default: 0 })
  totalQuota!: number

  @Column({ name: 'used_quota', type: 'int', default: 0 })
  usedQuota!: number

  @Column({ name: 'quota_reset_at', type: 'timestamptz', nullable: true })
  quotaResetAt!: Date | null

  @Column({ name: 'last_usage_at', type: 'timestamptz', nullable: true })
  lastUsageAt!: Date | null

  @OneToOne(() => UserModel, (user) => user.quota, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserModel

  get remainingQuota(): number {
    return this.totalQuota - this.usedQuota
  }

  get canGenerate(): boolean {
    return this.remainingQuota > 0
  }
}
