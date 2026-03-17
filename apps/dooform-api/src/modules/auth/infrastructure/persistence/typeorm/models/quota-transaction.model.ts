import { Entity, Column } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('quota_transactions')
export class QuotaTransactionModel extends BaseTypeOrmModel {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ name: 'transaction_type', type: 'varchar', length: 20, default: '' })
  transactionType!: string

  @Column({ type: 'int', default: 0 })
  amount!: number

  @Column({ name: 'balance_after', type: 'int', default: 0 })
  balanceAfter!: number

  @Column({ type: 'varchar', length: 500, nullable: true })
  reason!: string | null

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy!: string | null

  @Column({ name: 'document_id', type: 'varchar', length: 100, nullable: true })
  documentId!: string | null
}
