import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  CAPABILITIES,
  LIMITS,
  getCapability,
  getLimit,
} from '../../../auth/domain/capabilities.catalog'
import { UserTier } from '../../../document/domain/enums/document.enum'

import { OrganizationModel } from '../../infrastructure/persistence/typeorm/models/organization.model'
import { TierConfigModel } from '../../infrastructure/persistence/typeorm/models/tier-config.model'
import { TierConfigService } from './tier-config.service'

/**
 * Resolves a tenant's effective capabilities and numeric limits from the org's
 * tier code + any per-tier overrides stored in `tier_configs.features`.
 *
 * Two layers of resolution:
 *   1. Catalog defaults (CAPABILITIES, LIMITS in capabilities.catalog.ts) — applied
 *      via hierarchical sortOrder: an org's tier sortOrder must be ≥ the
 *      capability's `defaultMinTier` sortOrder.
 *   2. Per-tier overrides on `tier_configs.features.{capabilities, limits}` —
 *      explicit grants/revokes by a GLOBAL_ADMIN take precedence over (1).
 *
 * Use the `assert*` methods inside use-cases. Use `listEffectiveForOrg` to
 * serialize the resolved state into the /auth/me response so the frontend can
 * render upgrade prompts without round-trips.
 */
@Injectable()
export class TierService {
  private readonly logger = new Logger(TierService.name)

  constructor(
    @InjectRepository(OrganizationModel)
    private readonly organizations: Repository<OrganizationModel>,
    private readonly tierConfigs: TierConfigService,
  ) {}

  async resolveTierForOrg(orgId: string | null | undefined): Promise<string> {
    if (!orgId) return UserTier.FREE
    const org = await this.organizations.findOne({ where: { id: orgId } })
    return org?.tier ?? UserTier.FREE
  }

  async resolveTierConfig(orgId: string | null | undefined): Promise<TierConfigModel | undefined> {
    const code = await this.resolveTierForOrg(orgId)
    return this.tierConfigs.findByCode(code)
  }

  async hasCapability(
    orgId: string | null | undefined,
    capabilityKey: string,
  ): Promise<boolean> {
    const def = getCapability(capabilityKey)
    if (!def) {
      this.logger.warn(`Unknown capability requested: ${capabilityKey}`)
      return false
    }
    const tier = await this.resolveTierConfig(orgId)
    if (!tier || !tier.enabled) return false

    const overrides = readFeatureOverrides(tier.features)
    if (overrides.capabilitiesAdd.has(capabilityKey)) return true
    if (overrides.capabilitiesRemove.has(capabilityKey)) return false

    // Default: hierarchical sortOrder vs the capability's min-tier
    const minTier = await this.tierConfigs.findByCode(def.defaultMinTier)
    if (!minTier) return false
    return tier.sortOrder >= minTier.sortOrder
  }

  async assertCapability(
    orgId: string | null | undefined,
    capabilityKey: string,
  ): Promise<void> {
    const ok = await this.hasCapability(orgId, capabilityKey)
    if (ok) return
    const def = getCapability(capabilityKey)
    const minTier = def ? def.defaultMinTier : null
    throw new ForbiddenException({
      message: `Your subscription tier doesn't include this feature.`,
      capability: capabilityKey,
      requiredTier: minTier,
    })
  }

  async getLimitFor(
    orgId: string | null | undefined,
    limitKey: string,
  ): Promise<number | null> {
    const def = getLimit(limitKey)
    if (!def) {
      this.logger.warn(`Unknown limit requested: ${limitKey}`)
      return null
    }
    const tier = await this.resolveTierConfig(orgId)
    const tierCode = (tier?.code ?? UserTier.FREE) as UserTier

    const overrides = readFeatureOverrides(tier?.features ?? null)
    if (limitKey in overrides.limits) {
      return overrides.limits[limitKey]
    }

    // Fall back to the catalog default for the resolved tier code.
    if (tierCode in def.defaults) {
      return def.defaults[tierCode]
    }
    return null
  }

  async assertWithinLimit(
    orgId: string | null | undefined,
    limitKey: string,
    currentCount: number,
    addCount = 1,
  ): Promise<void> {
    const cap = await this.getLimitFor(orgId, limitKey)
    if (cap === null) return // unlimited
    if (currentCount + addCount <= cap) return
    const def = getLimit(limitKey)
    throw new ForbiddenException({
      message: `${def?.label ?? limitKey} limit reached for your subscription tier.`,
      limit: limitKey,
      cap,
      current: currentCount,
    })
  }

  /**
   * Serialize the org's resolved tier state for the frontend. Returns the tier
   * row plus the complete capability list and limits map (catalog defaults
   * blended with overrides). Cheap — reads from the TierConfigService cache.
   */
  async listEffectiveForOrg(orgId: string | null | undefined): Promise<{
    code: string
    label: string
    sortOrder: number
    capabilities: string[]
    limits: Record<string, number | null>
  }> {
    const tier = await this.resolveTierConfig(orgId)
    if (!tier) {
      // Org without a tier (shouldn't happen post-migration). Treat as FREE.
      return { code: UserTier.FREE, label: 'Free', sortOrder: 0, capabilities: [], limits: {} }
    }
    const overrides = readFeatureOverrides(tier.features)
    const allConfigs = await this.tierConfigs.getCachedConfigs()

    const capabilities: string[] = []
    for (const def of CAPABILITIES) {
      if (overrides.capabilitiesRemove.has(def.key)) continue
      if (overrides.capabilitiesAdd.has(def.key)) {
        capabilities.push(def.key)
        continue
      }
      const minTier = allConfigs.find((c) => c.code === def.defaultMinTier)
      if (minTier && tier.sortOrder >= minTier.sortOrder) {
        capabilities.push(def.key)
      }
    }

    const tierCode = tier.code as UserTier
    const limits: Record<string, number | null> = {}
    for (const def of LIMITS) {
      if (def.key in overrides.limits) {
        limits[def.key] = overrides.limits[def.key]
      } else if (tierCode in def.defaults) {
        limits[def.key] = def.defaults[tierCode]
      } else {
        limits[def.key] = null
      }
    }

    return {
      code: tier.code,
      label: tier.label,
      sortOrder: tier.sortOrder,
      capabilities,
      limits,
    }
  }
}

interface FeatureOverrides {
  capabilitiesAdd: Set<string>
  capabilitiesRemove: Set<string>
  limits: Record<string, number | null>
}

/**
 * Shape of `tier_configs.features` JSONB:
 *   {
 *     "capabilities": ["feature:pdf_editor", "-feature:remove_watermark"],
 *     "limits": { "limit:max_forms": 50, "limit:max_storage_bytes": 21474836480 }
 *   }
 *
 * A capability prefixed with "-" is an explicit revoke; bare keys are explicit
 * grants. Limits are absolute overrides (use null for "unlimited").
 */
function readFeatureOverrides(features: Record<string, unknown> | null): FeatureOverrides {
  const out: FeatureOverrides = {
    capabilitiesAdd: new Set(),
    capabilitiesRemove: new Set(),
    limits: {},
  }
  if (!features || typeof features !== 'object') return out
  const caps = Array.isArray((features as { capabilities?: unknown }).capabilities)
    ? ((features as { capabilities: unknown[] }).capabilities as unknown[])
    : []
  for (const c of caps) {
    if (typeof c !== 'string') continue
    if (c.startsWith('-')) out.capabilitiesRemove.add(c.slice(1))
    else out.capabilitiesAdd.add(c)
  }
  const limits = (features as { limits?: unknown }).limits
  if (limits && typeof limits === 'object' && !Array.isArray(limits)) {
    for (const [k, v] of Object.entries(limits as Record<string, unknown>)) {
      if (v === null || typeof v === 'number') out.limits[k] = v
    }
  }
  return out
}
