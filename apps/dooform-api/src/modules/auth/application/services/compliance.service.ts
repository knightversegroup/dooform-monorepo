import { randomUUID } from 'crypto'

import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { MailerService } from '../../../../common/mailer/mailer.service'
import { UserRole } from '../../../user/domain/enums/user.enum'
import { AuditLogModel } from '../../infrastructure/persistence/typeorm/models/audit-log.model'
import {
  ComplianceRuleModel,
  type ComplianceRuleConditions,
  type ComplianceSeverity,
} from '../../infrastructure/persistence/typeorm/models/compliance-rule.model'
import { ComplianceAlertModel } from '../../infrastructure/persistence/typeorm/models/compliance-alert.model'

import type { AuditEvent } from './audit-log.service'

export interface CreateRuleInput {
  organizationId: string | null
  name: string
  description?: string | null
  conditions: ComplianceRuleConditions
  severity?: ComplianceSeverity
  enabled?: boolean
  notifyEmails?: string | null
  createdByUserId?: string | null
}

export interface ListAlertsOptions {
  scopeOrganizationId: string | null
  callerRole: UserRole | string
  acknowledged?: boolean
  severity?: ComplianceSeverity
  page: number
  pageSize: number
}

/**
 * Configurable compliance / DLP rule engine. Admins create rules at runtime; every audit
 * event is evaluated against active rules and matches produce alerts (and optional
 * notification emails). No hardcoded patterns — what counts as "sensitive" is whatever
 * keywords the org admin types into a rule.
 */
@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name)

  // In-memory rule cache rebuilt on every change to keep evaluation fast.
  private rulesCache: ComplianceRuleModel[] = []
  private cacheLoadedAt = 0

  constructor(
    @InjectRepository(ComplianceRuleModel)
    private readonly rules: Repository<ComplianceRuleModel>,
    @InjectRepository(ComplianceAlertModel)
    private readonly alerts: Repository<ComplianceAlertModel>,
    private readonly mailer: MailerService,
  ) {}

  // ---------------------------------------------------------------------------
  // Cache
  // ---------------------------------------------------------------------------
  async reload(): Promise<void> {
    this.rulesCache = await this.rules.find({ where: { enabled: true } })
    this.cacheLoadedAt = Date.now()
    this.logger.log(`Reloaded compliance rule cache (${this.rulesCache.length} active rules)`)
  }

  private async ensureCache(): Promise<void> {
    // Refresh at most every 30s. Always reload on the first call (cacheLoadedAt=0).
    if (this.cacheLoadedAt === 0 || Date.now() - this.cacheLoadedAt > 30_000) {
      await this.reload()
    }
  }

  // ---------------------------------------------------------------------------
  // Rule CRUD
  // ---------------------------------------------------------------------------
  async listRules(scope: { organizationId: string | null; callerRole: string }): Promise<ComplianceRuleModel[]> {
    if (scope.callerRole === UserRole.GLOBAL_ADMIN) {
      return this.rules.find({ order: { createdAt: 'DESC' } })
    }
    // Tenant admins ONLY see rules they own. Global (NULL-org) rules still fire on
    // their events at evaluation time — that's by design — but they're hidden and
    // uneditable here so one tenant can't see (or modify) another tenant's rules.
    if (!scope.organizationId) return []
    return this.rules.find({
      where: { organizationId: scope.organizationId },
      order: { createdAt: 'DESC' },
    })
  }

  async createRule(input: CreateRuleInput, callerRole: string): Promise<ComplianceRuleModel> {
    // A NULL organizationId is reserved for GLOBAL_ADMIN-authored "global" rules that
    // fire on every tenant's events. Tenant admins must always pass their own org id.
    // Without this guard, a tenant admin whose JWT happens to have organizationId=null
    // (legacy account) would inadvertently create a global rule visible to all tenants.
    if (input.organizationId === null && callerRole !== UserRole.GLOBAL_ADMIN) {
      throw new ForbiddenException('Only GLOBAL_ADMIN can create global compliance rules')
    }
    if (!input.conditions?.actionPattern) {
      throw new ForbiddenException('actionPattern is required')
    }
    const rule = this.rules.create({
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      description: input.description ?? null,
      conditions: input.conditions,
      severity: input.severity ?? 'WARN',
      enabled: input.enabled ?? true,
      notifyEmails: input.notifyEmails ?? null,
      createdByUserId: input.createdByUserId ?? null,
    })
    const saved = await this.rules.save(rule)
    await this.reload()
    return saved
  }

  async updateRule(
    id: string,
    input: Partial<CreateRuleInput>,
    caller: { organizationId: string | null; role: string },
  ): Promise<ComplianceRuleModel> {
    const existing = await this.rules.findOne({ where: { id } })
    if (!existing) throw new NotFoundException('Rule not found')
    this.assertCanEditRule(existing, caller)

    if (input.name !== undefined) existing.name = input.name
    if (input.description !== undefined) existing.description = input.description ?? null
    if (input.conditions !== undefined) existing.conditions = input.conditions
    if (input.severity !== undefined) existing.severity = input.severity
    if (input.enabled !== undefined) existing.enabled = input.enabled
    if (input.notifyEmails !== undefined) existing.notifyEmails = input.notifyEmails ?? null

    const saved = await this.rules.save(existing)
    await this.reload()
    return saved
  }

  async deleteRule(id: string, caller: { organizationId: string | null; role: string }): Promise<void> {
    const existing = await this.rules.findOne({ where: { id } })
    if (!existing) throw new NotFoundException('Rule not found')
    this.assertCanEditRule(existing, caller)
    await this.rules.softDelete({ id })
    await this.reload()
  }

  private assertCanEditRule(
    rule: ComplianceRuleModel,
    caller: { organizationId: string | null; role: string },
  ): void {
    if (caller.role === UserRole.GLOBAL_ADMIN) return
    if (rule.organizationId === null) {
      throw new ForbiddenException('Only GLOBAL_ADMIN can edit global rules')
    }
    if (rule.organizationId !== caller.organizationId) {
      throw new ForbiddenException('Cannot edit a rule from another organization')
    }
  }

  // ---------------------------------------------------------------------------
  // Evaluation — called from AuditLogService after every successful write.
  // ---------------------------------------------------------------------------
  async evaluate(event: AuditEvent, auditLog: AuditLogModel): Promise<void> {
    await this.ensureCache()
    this.logger.log(
      `Compliance evaluate action=${event.action} eventOrg=${event.organizationId ?? 'null'} ` +
        `cacheSize=${this.rulesCache.length}`,
    )
    if (!this.rulesCache.length) return

    const eventOrg = event.organizationId ?? null
    for (const rule of this.rulesCache) {
      // Tenant scoping: tenant rules only fire on their tenant's events. Global rules
      // (organizationId=null) fire on every event.
      if (rule.organizationId !== null && rule.organizationId !== eventOrg) {
        this.logger.log(
          `  rule "${rule.name}" skipped: org mismatch (rule=${rule.organizationId} vs event=${eventOrg})`,
        )
        continue
      }

      const matchedKeywords = this.matches(rule.conditions, event)
      if (matchedKeywords === null) {
        this.logger.log(`  rule "${rule.name}" did NOT match action=${event.action}`)
        continue
      }

      this.logger.log(
        `  rule "${rule.name}" MATCHED — firing alert (matchedKeywords=${JSON.stringify(matchedKeywords)})`,
      )
      try {
        await this.fire(rule, event, auditLog, matchedKeywords)
      } catch (err) {
        this.logger.warn(
          `Compliance rule ${rule.id} (${rule.name}) failed to fire: ${(err as Error)?.message ?? err}`,
        )
      }
    }
  }

  private matches(
    conditions: ComplianceRuleConditions,
    event: AuditEvent,
  ): string[] | null {
    if (!this.actionMatches(conditions.actionPattern, event.action)) return null

    if (conditions.outcome && conditions.outcome !== 'any') {
      const outcome = event.outcome ?? 'success'
      if (outcome !== conditions.outcome) return null
    }

    if (conditions.actorRoles?.length && event.actor?.role) {
      if (!conditions.actorRoles.includes(event.actor.role)) return null
    }

    if (conditions.resourceType && event.resourceType !== conditions.resourceType) return null

    let matchedKeywords: string[] = []
    if (conditions.metadataKeywords?.length) {
      const haystack = [
        event.action,
        event.resourceType ?? '',
        event.resourceId ?? '',
        JSON.stringify(event.metadata ?? {}),
      ]
        .join(' ')
        .toLowerCase()
      matchedKeywords = conditions.metadataKeywords.filter((kw) =>
        haystack.includes(kw.toLowerCase()),
      )
      if (matchedKeywords.length === 0) return null
    }

    return matchedKeywords
  }

  private actionMatches(pattern: string, action: string): boolean {
    if (pattern === '*' || pattern === action) return true
    // Escape regex specials except '*' which we expand to '.*'.
    const re = new RegExp(
      '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
    )
    return re.test(action)
  }

  private async fire(
    rule: ComplianceRuleModel,
    event: AuditEvent,
    auditLog: AuditLogModel,
    matchedKeywords: string[],
  ): Promise<void> {
    const message = this.buildMessage(rule, event, matchedKeywords)
    await this.alerts.save(
      this.alerts.create({
        id: randomUUID(),
        organizationId: event.organizationId ?? null,
        ruleId: rule.id,
        ruleName: rule.name,
        auditLogId: auditLog.id,
        severity: rule.severity,
        message,
        matchedKeywords: matchedKeywords.length ? matchedKeywords : null,
        actorEmail: event.actor?.email ?? null,
        actorUserId: event.actor?.userId ?? null,
        action: event.action,
        acknowledgedAt: null,
        acknowledgedBy: null,
      }),
    )

    if (rule.notifyEmails) {
      const recipients = rule.notifyEmails
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      for (const to of recipients) {
        try {
          await this.mailer.sendComplianceAlert(
            to,
            `[Dooform compliance ${rule.severity}] ${rule.name}`,
            message,
          )
        } catch (err) {
          this.logger.warn(`Failed to send compliance email to ${to}: ${(err as Error)?.message ?? err}`)
        }
      }
    }
  }

  private buildMessage(rule: ComplianceRuleModel, event: AuditEvent, matched: string[]): string {
    const actor = event.actor?.email ?? event.actor?.userId ?? 'unknown actor'
    const resource = event.resourceType
      ? `${event.resourceType}${event.resourceId ? `/${event.resourceId}` : ''}`
      : 'no resource'
    const kw = matched.length ? ` Matched keywords: ${matched.join(', ')}.` : ''
    return `${actor} performed ${event.action} on ${resource}.${kw}`
  }

  // ---------------------------------------------------------------------------
  // Alert listing / acknowledgement
  // ---------------------------------------------------------------------------
  async listAlerts(options: ListAlertsOptions): Promise<{ data: ComplianceAlertModel[]; total: number }> {
    const qb = this.alerts.createQueryBuilder('a').orderBy('a.created_at', 'DESC')
    const isGlobal = options.callerRole === UserRole.GLOBAL_ADMIN || options.callerRole === 'GLOBAL_ADMIN'
    if (!isGlobal) {
      if (!options.scopeOrganizationId) return { data: [], total: 0 }
      qb.andWhere('a.organization_id = :orgId', { orgId: options.scopeOrganizationId })
    } else if (options.scopeOrganizationId) {
      qb.andWhere('a.organization_id = :orgId', { orgId: options.scopeOrganizationId })
    }
    if (options.acknowledged === true) qb.andWhere('a.acknowledged_at IS NOT NULL')
    if (options.acknowledged === false) qb.andWhere('a.acknowledged_at IS NULL')
    if (options.severity) qb.andWhere('a.severity = :sev', { sev: options.severity })

    qb.skip(options.page * options.pageSize).take(options.pageSize)
    const [data, total] = await qb.getManyAndCount()
    return { data, total }
  }

  async acknowledge(
    alertId: string,
    caller: { userId: string; organizationId: string | null; role: string },
  ): Promise<ComplianceAlertModel> {
    const alert = await this.alerts.findOne({ where: { id: alertId } })
    if (!alert) throw new NotFoundException('Alert not found')
    if (
      caller.role !== UserRole.GLOBAL_ADMIN &&
      alert.organizationId !== caller.organizationId
    ) {
      throw new ForbiddenException('Cannot acknowledge an alert from another organization')
    }
    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = caller.userId
    return this.alerts.save(alert)
  }

  async unreadCount(scope: { organizationId: string | null; callerRole: string }): Promise<number> {
    const isGlobal = scope.callerRole === UserRole.GLOBAL_ADMIN
    const where: Record<string, unknown> = { acknowledgedAt: IsNull() }
    if (!isGlobal) {
      if (!scope.organizationId) return 0
      where.organizationId = scope.organizationId
    }
    return this.alerts.count({ where: where as object })
  }
}
