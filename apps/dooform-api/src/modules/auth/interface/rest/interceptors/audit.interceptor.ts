import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'

import { AuditLogService } from '../../../application/services/audit-log.service'
import {
  AUDIT_ACTION_KEY,
  AUDIT_SKIP_KEY,
} from '../decorators/audit.decorators'
import type { AuthenticatedUser } from '../types/authenticated-user'

// Body fields that get redacted before being attached to a log entry. Defense in depth:
// even if a controller method skipped the standard "don't log this body" rule, we'll
// never write a password to the audit table.
const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'currentpassword',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'cookie',
  'secret',
])

const MAX_LOG_BYTES = 4 * 1024

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[truncated]'
  if (value == null) return value
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redact(v, depth + 1))
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '[redacted]'
      } else {
        out[k] = redact(v, depth + 1)
      }
    }
    return out
  }
  if (typeof value === 'string' && value.length > 500) return value.slice(0, 500) + '…'
  return value
}

function clamp(value: unknown): unknown {
  try {
    const json = JSON.stringify(value)
    if (json.length > MAX_LOG_BYTES) {
      return { _truncated: true, preview: json.slice(0, MAX_LOG_BYTES) + '…' }
    }
    return value
  } catch {
    return undefined
  }
}

/**
 * Map an HTTP method to a stable verb used in the audit action key.
 * GET → read, POST → create, PUT/PATCH → update, DELETE → delete.
 */
const METHOD_VERB: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
}

/**
 * Auto-derive an action key from the route. e.g.
 *   POST   /api/templates                    → "templates.create"
 *   PATCH  /api/documents/:id                → "documents.update"
 *   POST   /api/v1/documents/:id/shares      → "documents.shares.create"
 *   DELETE /api/organization/members/:userId → "organization.members.delete"
 *
 * Falls back to "request" if nothing useful can be extracted.
 */
function deriveAction(method: string, url: string): string {
  // Strip query string and the leading /api prefix.
  const path = url.split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '')
  if (!path) return 'request'
  const verb = METHOD_VERB[method.toUpperCase()] ?? method.toLowerCase()
  // Build a noun-ish stem from the path. Drop:
  //   - empty segments
  //   - dynamic ids (uuid-shaped or 8+ hex chars)
  //   - API version segments (v1, v2, ...) so rules don't have to know which version a
  //     route lives behind. e.g. POST /api/v1/documents/:id/shares becomes
  //     "documents.shares.create" rather than "v1.documents.shares.create".
  const segments = path.split('/').filter((s) => {
    if (!s) return false
    if (/^v\d+$/i.test(s)) return false
    if (/^[0-9a-f-]{8,}$/i.test(s)) return false
    return true
  })
  const stem = segments.join('.')
  return stem ? `${stem}.${verb}` : verb
}

/**
 * Global interceptor that records every controller invocation in the audit log unless
 * the route opts out via @SkipAudit(). By default we skip GETs (too chatty) and only
 * record state-changing methods, but a route can set @AuditAction(...) to opt in.
 *
 * Failures (4xx/5xx) are recorded with outcome='failure' so admins can see who attempted
 * what when access was denied or validation failed.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle()

    const skip = this.reflector.getAllAndOverride<boolean>(AUDIT_SKIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (skip) return next.handle()

    const explicitAction = this.reflector.getAllAndOverride<string>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const req = context.switchToHttp().getRequest()
    const method = (req.method || 'GET').toUpperCase()

    // By default, log only state-changing requests. Reads are logged when they explicitly
    // opt in via @AuditAction. This keeps the audit table from filling up with noise.
    const isMutation = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS'
    if (!isMutation && !explicitAction) return next.handle()

    const user = req.user as AuthenticatedUser | undefined
    const action = explicitAction || deriveAction(method, req.originalUrl || req.url || '')
    this.logger.log(
      `Audit ${method} ${req.originalUrl || req.url} → action=${action} actor=${user?.email ?? 'anon'}`,
    )
    const baseEvent = {
      organizationId: user?.organizationId ?? null,
      actor: user
        ? { userId: user.userId, email: user.email, role: user.role }
        : null,
      action,
      resourceType: this.deriveResourceType(req.originalUrl || req.url || ''),
      resourceId:
        (req.params && (req.params.id || req.params.documentId || req.params.templateId || req.params.userId)) ??
        null,
      ip: req.ip ?? req.socket?.remoteAddress ?? null,
      userAgent: req.headers?.['user-agent']?.toString().slice(0, 500) ?? null,
    }

    const requestSummary = clamp(redact({
      method,
      params: req.params,
      query: req.query,
      // Avoid logging full bodies for file uploads — they balloon the row.
      body:
        req.is && req.is('multipart/*')
          ? '[multipart]'
          : req.body && Object.keys(req.body).length
            ? req.body
            : undefined,
    }))

    return next.handle().pipe(
      tap({
        next: () => {
          this.audit.log({
            ...baseEvent,
            metadata: requestSummary as Record<string, unknown>,
          })
        },
        error: (err) => {
          this.audit.log({
            ...baseEvent,
            outcome: 'failure',
            metadata: {
              ...(requestSummary as Record<string, unknown>),
              error:
                err && typeof err === 'object'
                  ? {
                      name: (err as Error).name,
                      message: (err as Error).message,
                      status: (err as { status?: number }).status,
                    }
                  : String(err),
            },
          })
        },
      }),
    )
  }

  private deriveResourceType(url: string): string | null {
    const path = url.split('?')[0].replace(/^\/api\/?/, '').replace(/\/$/, '')
    if (!path) return null
    const first = path.split('/')[0]
    return first || null
  }
}
