import { SetMetadata } from '@nestjs/common'

// Override the auto-derived action key. Default derivation is `method.path` segments
// (e.g. POST /api/templates → "template.create"). Use this when the auto-name is wrong
// or for endpoints that need a domain-specific verb.
export const AUDIT_ACTION_KEY = 'auditAction'
export const AuditAction = (action: string) => SetMetadata(AUDIT_ACTION_KEY, action)

// Skip audit logging for this route. Useful for chatty health checks, Swagger fetches,
// or routes that already write their own richer log line (e.g. auth.service does explicit
// login/logout entries with actor metadata that the interceptor wouldn't have).
export const AUDIT_SKIP_KEY = 'auditSkip'
export const SkipAudit = () => SetMetadata(AUDIT_SKIP_KEY, true)
