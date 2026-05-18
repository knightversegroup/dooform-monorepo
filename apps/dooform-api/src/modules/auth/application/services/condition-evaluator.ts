import type { AssignmentCondition } from '../../infrastructure/persistence/typeorm/models/role-assignment.model'

/**
 * Context passed to {@link evaluateCondition} from PermissionService.userHas().
 * All fields are optional — a condition that references something not present
 * in the context is treated as a fail unless the rule is itself absent.
 */
export interface ConditionContext {
  now?: Date
  action?: string
  ip?: string
  outcome?: 'success' | 'failure'
}

/**
 * Evaluate an IAM-style assignment condition. Returns true if the assignment
 * is "active" for this context. A null/undefined condition is always active.
 *
 * Rules are AND-ed: every defined rule must pass. Within a rule that holds an
 * array (e.g. actionMatches), ANY entry matching is enough.
 */
export function evaluateCondition(
  condition: AssignmentCondition | null | undefined,
  ctx: ConditionContext = {},
): boolean {
  if (!condition) return true
  const now = ctx.now ?? new Date()

  if (condition.validBefore) {
    const before = new Date(condition.validBefore)
    if (Number.isNaN(before.getTime()) || now >= before) return false
  }
  if (condition.validAfter) {
    const after = new Date(condition.validAfter)
    if (Number.isNaN(after.getTime()) || now < after) return false
  }

  if (condition.actionMatches && condition.actionMatches.length > 0) {
    if (!ctx.action) return false
    const matched = condition.actionMatches.some((pattern) => matchGlob(pattern, ctx.action!))
    if (!matched) return false
  }

  if (condition.outcomeIn && condition.outcomeIn.length > 0) {
    if (!ctx.outcome || !condition.outcomeIn.includes(ctx.outcome)) return false
  }

  if (condition.ipAllow && condition.ipAllow.length > 0) {
    if (!ctx.ip) return false
    const matched = condition.ipAllow.some((cidr) => ipInCidr(ctx.ip!, cidr))
    if (!matched) return false
  }

  return true
}

/**
 * Simple glob: `*` matches any run of non-colon characters within a permission
 * key (e.g. `templates:*` matches `templates:create` but not `templates:foo:bar`).
 * `**` matches across colons.
 */
function matchGlob(pattern: string, value: string): boolean {
  // Translate the glob into a regex by escaping regex specials and replacing
  // `**` and `*` with their respective patterns. `**` first, otherwise it
  // would be consumed by the `*` replacement.
  const re = new RegExp(
    '^' +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '___DBLSTAR___')
        .replace(/\*/g, '[^:]*')
        .replace(/___DBLSTAR___/g, '.*') +
      '$',
  )
  return re.test(value)
}

/**
 * Quick CIDR membership check. Supports IPv4 only — IPv6 is rare for the
 * intra-cluster traffic we expect to gate this way, and a real implementation
 * should plug in a library if v6 support is needed.
 */
function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/')
  if (!range) return false
  const bits = bitsStr ? parseInt(bitsStr, 10) : 32
  if (!Number.isFinite(bits) || bits < 0 || bits > 32) return false
  const ipN = ipToInt(ip)
  const rangeN = ipToInt(range)
  if (ipN === null || rangeN === null) return false
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ipN & mask) === (rangeN & mask)
}

function ipToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    const v = parseInt(p, 10)
    if (!Number.isFinite(v) || v < 0 || v > 255) return null
    n = (n << 8) | v
  }
  return n >>> 0
}
