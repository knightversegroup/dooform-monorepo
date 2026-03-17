import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('activity_logs')
export class ActivityLogModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 10, default: '' })
  method!: string

  @Column({ type: 'varchar', length: 500, default: '' })
  path!: string

  @Column({ name: 'user_agent', type: 'varchar', length: 500, default: '' })
  userAgent!: string

  @Column({ name: 'ip_address', type: 'varchar', length: 45, default: '' })
  ipAddress!: string

  @Column({ name: 'request_body', type: 'text', nullable: true })
  requestBody!: string | null

  @Column({ name: 'query_params', type: 'text', nullable: true })
  queryParams!: string | null

  @Column({ name: 'status_code', type: 'int', default: 0 })
  statusCode!: number

  @Column({ name: 'response_time', type: 'bigint', default: 0 })
  responseTime!: number

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId!: string | null

  @Index()
  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail!: string | null
}
