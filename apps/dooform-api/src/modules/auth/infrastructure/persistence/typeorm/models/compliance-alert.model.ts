import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import type { ComplianceSeverity } from './compliance-rule.model'

@Entity('compliance_alerts')
@Index('idx_compliance_alerts_org_created', ['organizationId', 'createdAt'])
@Index('idx_compliance_alerts_unread', ['acknowledgedAt'])
export class ComplianceAlertModel extends BaseTypeOrmModel {
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ name: 'rule_id', type: 'uuid' })
  ruleId!: string

  // Snapshot — survives the rule being deleted/renamed.
  @Column({ name: 'rule_name', type: 'varchar', length: 255 })
  ruleName!: string

  @Column({ name: 'audit_log_id', type: 'uuid' })
  auditLogId!: string

  @Column({ type: 'varchar', length: 16 })
  severity!: ComplianceSeverity

  @Column({ type: 'text' })
  message!: string

  @Column({ name: 'matched_keywords', type: 'jsonb', nullable: true })
  matchedKeywords!: string[] | null

  // Snapshot of actor at the time of the event for fast list rendering.
  @Column({ name: 'actor_email', type: 'varchar', length: 255, nullable: true })
  actorEmail!: string | null

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null

  @Column({ type: 'varchar', length: 64, nullable: true })
  action!: string | null

  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true })
  acknowledgedAt!: Date | null

  @Column({ name: 'acknowledged_by', type: 'uuid', nullable: true })
  acknowledgedBy!: string | null
}
