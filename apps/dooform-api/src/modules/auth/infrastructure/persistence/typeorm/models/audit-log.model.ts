import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('audit_logs')
@Index('idx_audit_logs_org_created', ['organizationId', 'createdAt'])
@Index('idx_audit_logs_actor', ['actorUserId'])
@Index('idx_audit_logs_action', ['action'])
@Index('idx_audit_logs_resource', ['resourceType', 'resourceId'])
export class AuditLogModel extends BaseTypeOrmModel {
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null

  // Email snapshot at the time of the event — survives the actor being deleted.
  @Column({ name: 'actor_email', type: 'varchar', length: 255, nullable: true })
  actorEmail!: string | null

  @Column({ name: 'actor_role', type: 'varchar', length: 32, nullable: true })
  actorRole!: string | null

  // Stable machine-readable event key, e.g. "auth.login", "template.create".
  @Column({ type: 'varchar', length: 64 })
  action!: string

  // Optional resource the event acts on. resourceType is a domain noun
  // (template, document, organization, member, invite). resourceId is its uuid.
  @Column({ name: 'resource_type', type: 'varchar', length: 64, nullable: true })
  resourceType!: string | null

  @Column({ name: 'resource_id', type: 'varchar', length: 255, nullable: true })
  resourceId!: string | null

  // 'success' | 'failure' — failures (e.g. bad password) are logged for forensics.
  @Column({ type: 'varchar', length: 16, default: 'success' })
  outcome!: string

  // Free-form context: what changed, before/after, request body summary, etc.
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip!: string | null

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null
}
