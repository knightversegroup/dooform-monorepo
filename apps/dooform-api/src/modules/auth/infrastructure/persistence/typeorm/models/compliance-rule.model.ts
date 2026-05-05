import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

export interface ComplianceRuleConditions {
  // Glob-style pattern matched against the audit event action key. Examples:
  //   "documents.share"      — exact match
  //   "documents.*"          — any documents.* action
  //   "*"                    — every action (use sparingly)
  actionPattern: string
  // Optional case-insensitive keywords. If supplied, the rule fires only when the
  // audit event's metadata JSON serialization contains AT LEAST ONE keyword. Used to
  // detect "this looks like sensitive data" — e.g. ["ssn", "credit card", "passport"].
  metadataKeywords?: string[]
  // Optional: only fire when the actor's role is in this list. Empty/missing = any role.
  actorRoles?: string[]
  // Optional: 'success' | 'failure' | 'any' (default 'any').
  outcome?: 'success' | 'failure' | 'any'
  // Optional: only fire when resourceType matches.
  resourceType?: string
}

export type ComplianceSeverity = 'INFO' | 'WARN' | 'CRITICAL'

@Entity('compliance_rules')
@Index('idx_compliance_rules_org', ['organizationId'])
@Index('idx_compliance_rules_enabled', ['enabled'])
export class ComplianceRuleModel extends BaseTypeOrmModel {
  // null = global rule that applies to every tenant. Tenant-scoped rules apply only to
  // events from that org. ORG_ADMIN can only create org-scoped rules; GLOBAL_ADMIN may
  // create either.
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description!: string | null

  @Column({ type: 'jsonb' })
  conditions!: ComplianceRuleConditions

  @Column({ type: 'varchar', length: 16, default: 'WARN' })
  severity!: ComplianceSeverity

  @Column({ type: 'boolean', default: true })
  enabled!: boolean

  // Comma-separated emails. Empty = no email notifications (alerts still recorded
  // in the compliance_alerts table for in-app review).
  @Column({ name: 'notify_emails', type: 'text', nullable: true })
  notifyEmails!: string | null

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null
}
