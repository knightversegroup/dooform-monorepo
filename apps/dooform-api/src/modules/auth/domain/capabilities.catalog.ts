// Single source of truth for tier-gated capabilities and quantitative limits.
// Add a new capability here, decorate the route with @RequireCapability(key),
// and it surfaces in the tier admin UI automatically. Per-tier overrides live in
// `tier_configs.features` (JSONB) — null means "use catalog default".

import { UserTier } from '../../document/domain/enums/document.enum'

export interface CapabilityDefinition {
  key: string
  group: string
  label: string
  description: string
  /** Lowest tier (by sortOrder) that includes this capability by default. */
  defaultMinTier: UserTier
}

/**
 * Capabilities are binary — either the org has access or it doesn't. They gate
 * specific features (PDF editor, API access, SSO). For numeric caps, use LIMITS.
 */
export const CAPABILITIES: CapabilityDefinition[] = [
  // Branding
  {
    key: 'feature:remove_watermark',
    group: 'Branding',
    label: 'Remove platform watermark',
    description: 'Skip the Dooform branding watermark on generated PDFs.',
    defaultMinTier: UserTier.BASIC,
  },
  {
    key: 'feature:custom_branding',
    group: 'Branding',
    label: 'Custom branding',
    description: 'Upload custom logos and use your own watermark presets.',
    defaultMinTier: UserTier.PRO,
  },

  // Documents
  {
    key: 'feature:pdf_editor',
    group: 'Documents',
    label: 'PDF editor',
    description: 'Annotate, redact, and edit PDFs after generation.',
    defaultMinTier: UserTier.PRO,
  },
  {
    key: 'feature:docx_export',
    group: 'Documents',
    label: 'Export to DOCX',
    description: 'Download generated documents as editable DOCX (not just PDF).',
    defaultMinTier: UserTier.BASIC,
  },

  // Integrations / advanced
  {
    key: 'feature:api_access',
    group: 'Platform',
    label: 'API access',
    description: 'Programmatic access via REST API + personal access tokens.',
    defaultMinTier: UserTier.ADVANCE,
  },
  {
    key: 'feature:workflow_automation',
    group: 'Workflow',
    label: 'Workflow automation',
    description: 'Multi-step approval workflows and scheduled document generation.',
    defaultMinTier: UserTier.ADVANCE,
  },
  {
    key: 'feature:sso',
    group: 'Platform',
    label: 'SSO / SAML',
    description: 'Single sign-on via SAML 2.0 or OIDC for your organization.',
    defaultMinTier: UserTier.ENTERPRISE,
  },
]

export interface LimitDefinition {
  key: string
  group: string
  label: string
  description: string
  unit: 'count' | 'bytes' | 'count_per_month'
  /**
   * Default cap per tier. `null` means unlimited; explicit numbers are caps.
   * Missing tiers default to the next-lower tier's value via the resolver.
   */
  defaults: Record<UserTier, number | null>
}

const KB = 1024
const MB = 1024 * KB
const GB = 1024 * MB
const TB = 1024 * GB

/**
 * Numeric caps enforced before resource creation. `assertWithinLimit` reads
 * these via TierService and throws 403 if a write would exceed the cap.
 */
export const LIMITS: LimitDefinition[] = [
  {
    key: 'limit:max_forms',
    group: 'Forms',
    label: 'Max forms',
    description: 'Cap on the number of forms an organization can keep alive.',
    unit: 'count',
    defaults: {
      [UserTier.FREE]: 3,
      [UserTier.BASIC]: 25,
      [UserTier.PRO]: 250,
      [UserTier.ADVANCE]: 2500,
      [UserTier.ENTERPRISE]: null,
    },
  },
  {
    key: 'limit:max_templates',
    group: 'Templates',
    label: 'Max templates',
    description: 'Cap on the number of templates an organization can keep alive.',
    unit: 'count',
    defaults: {
      [UserTier.FREE]: 5,
      [UserTier.BASIC]: 50,
      [UserTier.PRO]: 500,
      [UserTier.ADVANCE]: 5000,
      [UserTier.ENTERPRISE]: null,
    },
  },
  {
    key: 'limit:max_members',
    group: 'Organization',
    label: 'Max members',
    description: 'Cap on the number of users an organization can invite.',
    unit: 'count',
    defaults: {
      [UserTier.FREE]: 1,
      [UserTier.BASIC]: 5,
      [UserTier.PRO]: 25,
      [UserTier.ADVANCE]: 100,
      [UserTier.ENTERPRISE]: null,
    },
  },
  {
    key: 'limit:max_storage_bytes',
    group: 'Storage',
    label: 'Max storage',
    description: 'Total storage (in bytes) across documents and templates.',
    unit: 'bytes',
    defaults: {
      [UserTier.FREE]: 1 * GB,
      [UserTier.BASIC]: 10 * GB,
      [UserTier.PRO]: 100 * GB,
      [UserTier.ADVANCE]: 1 * TB,
      [UserTier.ENTERPRISE]: null,
    },
  },
  {
    key: 'limit:max_documents_per_month',
    group: 'Documents',
    label: 'Max documents per month',
    description:
      'Cap on the number of documents an organization can generate in a rolling month. Stubbed in v1 — counter table arrives in a follow-up.',
    unit: 'count_per_month',
    defaults: {
      [UserTier.FREE]: 20,
      [UserTier.BASIC]: 200,
      [UserTier.PRO]: 2000,
      [UserTier.ADVANCE]: 20000,
      [UserTier.ENTERPRISE]: null,
    },
  },
]

export const CAPABILITY_KEYS = new Set(CAPABILITIES.map((c) => c.key))
export const LIMIT_KEYS = new Set(LIMITS.map((l) => l.key))

export function getCapability(key: string): CapabilityDefinition | undefined {
  return CAPABILITIES.find((c) => c.key === key)
}

export function getLimit(key: string): LimitDefinition | undefined {
  return LIMITS.find((l) => l.key === key)
}
