import { SetMetadata } from '@nestjs/common'

export const CAPABILITIES_METADATA = 'requiredCapabilities'

/**
 * Tier-based capability gate. Stacks with `@RequirePermission(...)` — both must
 * pass. Use a capability key from `capabilities.catalog.ts`, e.g.
 * `@RequireCapability('feature:pdf_editor')`.
 *
 * If the caller's org tier doesn't include the capability (catalog default + any
 * per-tier override), the request is rejected with 403 and a body that names the
 * required tier so the frontend can render an upgrade prompt.
 */
export const RequireCapability = (...keys: string[]) =>
  SetMetadata(CAPABILITIES_METADATA, keys)
