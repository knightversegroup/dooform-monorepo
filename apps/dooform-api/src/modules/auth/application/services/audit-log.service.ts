import { randomUUID } from 'crypto'

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserRole } from '../../../user/domain/enums/user.enum'

import { AuditLogModel } from '../../infrastructure/persistence/typeorm/models/audit-log.model'
import { ComplianceService } from './compliance.service'

export interface AuditEvent {
  organizationId?: string | null
  actor?: {
    userId?: string | null
    email?: string | null
    role?: string | null
  } | null
  action: string
  resourceType?: string | null
  resourceId?: string | null
  outcome?: 'success' | 'failure'
  metadata?: Record<string, unknown> | null
  ip?: string | null
  userAgent?: string | null
}

export interface ListAuditLogsOptions {
  // Caller's effective scope. GLOBAL_ADMIN may pass `null` to list across every tenant.
  scopeOrganizationId: string | null
  callerRole: UserRole | string
  // Optional filters
  actorUserId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  outcome?: string
  fromDate?: Date
  toDate?: Date
  page: number
  pageSize: number
}

/**
 * Compliance audit log. Every meaningful actor action is recorded here so org admins
 * can answer "who did what when". Writes are fire-and-forget so a logging blip doesn't
 * fail the user request — failures are warned to console instead.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)

  constructor(
    @InjectRepository(AuditLogModel)
    private readonly logs: Repository<AuditLogModel>,
    // forwardRef keeps the DI container happy even though the import is one-way at
    // runtime — ComplianceService imports only the AuditEvent type, not the class.
    @Inject(forwardRef(() => ComplianceService))
    private readonly compliance: ComplianceService,
  ) {}

  log(event: AuditEvent): void {
    void this.logSync(event).catch((err) => {
      this.logger.warn(`Audit log write failed for action=${event.action}: ${err?.message ?? err}`)
    })
  }

  private async logSync(event: AuditEvent): Promise<void> {
    const saved = await this.logs.save(
      this.logs.create({
        id: randomUUID(),
        organizationId: event.organizationId ?? null,
        actorUserId: event.actor?.userId ?? null,
        actorEmail: event.actor?.email ?? null,
        actorRole: event.actor?.role ?? null,
        action: event.action,
        resourceType: event.resourceType ?? null,
        resourceId: event.resourceId ?? null,
        outcome: event.outcome ?? 'success',
        metadata: event.metadata ?? null,
        ip: event.ip ?? null,
        userAgent: event.userAgent ?? null,
      }),
    )

    // Run admin-defined compliance rules against the event. Failures here must never
    // abort the surrounding request — log and move on.
    try {
      await this.compliance.evaluate(event, saved)
    } catch (err) {
      this.logger.warn(
        `Compliance evaluation failed for action=${event.action}: ${(err as Error)?.message ?? err}`,
      )
    }
  }

  async list(options: ListAuditLogsOptions): Promise<{ data: AuditLogModel[]; total: number }> {
    const qb = this.logs.createQueryBuilder('log').orderBy('log.created_at', 'DESC')

    // Cross-tenant view is gated to GLOBAL_ADMIN. Any other caller is hard-scoped to
    // their org id regardless of what they pass in.
    const isGlobal = options.callerRole === UserRole.GLOBAL_ADMIN || options.callerRole === 'GLOBAL_ADMIN'
    if (!isGlobal) {
      if (!options.scopeOrganizationId) {
        return { data: [], total: 0 }
      }
      qb.andWhere('log.organization_id = :orgId', { orgId: options.scopeOrganizationId })
    } else if (options.scopeOrganizationId) {
      // GLOBAL_ADMIN narrowed to a specific tenant
      qb.andWhere('log.organization_id = :orgId', { orgId: options.scopeOrganizationId })
    }

    if (options.actorUserId) qb.andWhere('log.actor_user_id = :u', { u: options.actorUserId })
    if (options.action) qb.andWhere('log.action = :a', { a: options.action })
    if (options.resourceType) qb.andWhere('log.resource_type = :rt', { rt: options.resourceType })
    if (options.resourceId) qb.andWhere('log.resource_id = :rid', { rid: options.resourceId })
    if (options.outcome) qb.andWhere('log.outcome = :o', { o: options.outcome })
    if (options.fromDate) qb.andWhere('log.created_at >= :from', { from: options.fromDate })
    if (options.toDate) qb.andWhere('log.created_at <= :to', { to: options.toDate })

    qb.skip(options.page * options.pageSize).take(options.pageSize)

    const [data, total] = await qb.getManyAndCount()
    return { data, total }
  }
}
