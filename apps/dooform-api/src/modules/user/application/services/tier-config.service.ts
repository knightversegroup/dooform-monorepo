import { randomUUID } from 'crypto'

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserTier } from '../../../document/domain/enums/document.enum'

import { TierConfigModel } from '../../infrastructure/persistence/typeorm/models/tier-config.model'

interface TierSeed {
  code: string
  label: string
  description: string
  applyBrandingWatermark: boolean
  sortOrder: number
}

const SEED: TierSeed[] = [
  {
    code: UserTier.FREE,
    label: 'Free',
    description: 'Basic plan. PDFs include the Dooform branding watermark.',
    applyBrandingWatermark: true,
    sortOrder: 10,
  },
  {
    code: UserTier.BASIC,
    label: 'Basic',
    description: 'Removes the platform branding watermark; higher quotas than Free.',
    applyBrandingWatermark: false,
    sortOrder: 20,
  },
  {
    code: UserTier.PRO,
    label: 'Pro',
    description: 'Adds the PDF editor and custom branding; unlocks Pro templates.',
    applyBrandingWatermark: false,
    sortOrder: 30,
  },
  {
    code: UserTier.ADVANCE,
    label: 'Advance',
    description: 'API access, workflow automation, and high quotas.',
    applyBrandingWatermark: false,
    sortOrder: 40,
  },
  {
    code: UserTier.ENTERPRISE,
    label: 'Enterprise',
    description: 'Unlimited usage, SSO, and dedicated support.',
    applyBrandingWatermark: false,
    sortOrder: 50,
  },
]

@Injectable()
export class TierConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TierConfigService.name)
  private cache: TierConfigModel[] = []
  private cacheLoadedAt = 0

  constructor(
    @InjectRepository(TierConfigModel)
    private readonly repo: Repository<TierConfigModel>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.migrateTemplateTierColumn()
    await this.migrateOrganizationAndUserTierColumns()
    await this.seedDefaults()
    await this.reload()
  }

  /**
   * One-shot column conversion: `templates.tier` was originally a Postgres enum
   * (FREE/BASIC/PRO/PREMIUM/ENTERPRISE) but is now a free-form varchar referencing
   * `tier_configs.code` (lowercase). TypeORM's `synchronize` can't translate
   * enum→varchar with implicit casts, so we issue the ALTER manually if we detect
   * the column is still enum-typed, then lowercase any historical values.
   *
   * Idempotent: subsequent boots find the column as varchar and skip the ALTER.
   */
  private async migrateTemplateTierColumn(): Promise<void> {
    try {
      const ds = this.repo.manager.connection
      const rows: Array<{ data_type: string; udt_name: string }> = await ds.query(
        `SELECT data_type, udt_name
         FROM information_schema.columns
         WHERE table_name = 'templates' AND column_name = 'tier'`,
      )
      const isEnum = rows[0]?.data_type === 'USER-DEFINED'
      if (isEnum) {
        await ds.query(`ALTER TABLE templates ALTER COLUMN tier DROP DEFAULT`)
        await ds.query(
          `ALTER TABLE templates
             ALTER COLUMN tier TYPE varchar(32) USING tier::text`,
        )
        await ds.query(`ALTER TABLE templates ALTER COLUMN tier SET DEFAULT 'free'`)
        await ds.query(`DROP TYPE IF EXISTS templates_tier_enum CASCADE`)
        this.logger.log('Migrated templates.tier from enum to varchar')
      }
      // Always normalize: tier codes are lowercase to match the unified tier table.
      await ds.query(
        `UPDATE templates SET tier = LOWER(tier) WHERE tier <> LOWER(tier)`,
      )
    } catch (err) {
      this.logger.warn(
        `templates.tier migration skipped: ${(err as Error)?.message ?? err}`,
      )
    }
  }

  /**
   * Mirror of `migrateTemplateTierColumn` for `organizations.tier` and
   * `users.user_tier`. The original UserTier Postgres enum was `free|pro|max`;
   * we now want five tiers (`free|basic|pro|advance|enterprise`) and don't want
   * to maintain a Postgres enum at all. Converts to varchar(32) on first boot
   * and remaps the legacy `'max'` value to `'enterprise'`.
   *
   * Idempotent: rerun is a no-op once the column is varchar.
   */
  private async migrateOrganizationAndUserTierColumns(): Promise<void> {
    const targets: Array<{ table: string; column: string }> = [
      { table: 'organizations', column: 'tier' },
      { table: 'users', column: 'user_tier' },
    ]
    for (const t of targets) {
      try {
        const ds = this.repo.manager.connection
        const rows: Array<{ data_type: string; udt_name: string }> = await ds.query(
          `SELECT data_type, udt_name
           FROM information_schema.columns
           WHERE table_name = $1 AND column_name = $2`,
          [t.table, t.column],
        )
        const isEnum = rows[0]?.data_type === 'USER-DEFINED'
        const enumTypeName = rows[0]?.udt_name
        if (isEnum) {
          await ds.query(`ALTER TABLE ${t.table} ALTER COLUMN ${t.column} DROP DEFAULT`)
          await ds.query(
            `ALTER TABLE ${t.table}
               ALTER COLUMN ${t.column} TYPE varchar(32) USING ${t.column}::text`,
          )
          await ds.query(
            `ALTER TABLE ${t.table} ALTER COLUMN ${t.column} SET DEFAULT 'free'`,
          )
          if (enumTypeName) {
            await ds.query(`DROP TYPE IF EXISTS ${enumTypeName} CASCADE`)
          }
          this.logger.log(`Migrated ${t.table}.${t.column} from enum to varchar`)
        }
        // Legacy 'max' → 'enterprise' remap. Idempotent: no rows means no-op.
        await ds.query(
          `UPDATE ${t.table} SET ${t.column} = 'enterprise' WHERE ${t.column} = 'max'`,
        )
        // Lowercase normalization to match tier_configs.code.
        await ds.query(
          `UPDATE ${t.table} SET ${t.column} = LOWER(${t.column}) WHERE ${t.column} <> LOWER(${t.column})`,
        )
      } catch (err) {
        this.logger.warn(
          `${t.table}.${t.column} migration skipped: ${(err as Error)?.message ?? err}`,
        )
      }
    }
  }

  private async seedDefaults(): Promise<void> {
    const existing = await this.repo.find()
    const existingCodes = new Set(existing.map((r) => r.code))
    const toInsert = SEED.filter((s) => !existingCodes.has(s.code))
    if (!toInsert.length) return
    await this.repo.save(
      toInsert.map((s) =>
        this.repo.create({
          id: randomUUID(),
          code: s.code,
          label: s.label,
          description: s.description,
          applyBrandingWatermark: s.applyBrandingWatermark,
          sortOrder: s.sortOrder,
          enabled: true,
          features: null,
        }),
      ),
    )
    this.logger.log(`Seeded ${toInsert.length} tier configs`)
  }

  async reload(): Promise<void> {
    this.cache = await this.repo.find({ order: { sortOrder: 'ASC' } })
    this.cacheLoadedAt = Date.now()
  }

  private async ensureCache(): Promise<void> {
    if (this.cacheLoadedAt === 0 || Date.now() - this.cacheLoadedAt > 30_000) {
      await this.reload()
    }
  }

  /**
   * Cache-reading accessors for downstream services (TierService, TierLimitService).
   * Same in-memory cache as the rest of this class — 30-second TTL.
   */
  async getCachedConfigs(): Promise<TierConfigModel[]> {
    await this.ensureCache()
    return this.cache
  }

  async findByCode(code: string | null | undefined): Promise<TierConfigModel | undefined> {
    if (!code) return undefined
    await this.ensureCache()
    const lower = code.toLowerCase()
    return this.cache.find((c) => c.code === lower) ?? this.cache.find((c) => c.code === code)
  }

  /** Hot-path call from the document pipeline. Falls back to "watermark on" for unknown tiers. */
  async shouldApplyWatermark(tier: string | null | undefined): Promise<boolean> {
    if (!tier) return true
    await this.ensureCache()
    const found = this.cache.find((c) => c.code === tier)
    if (!found) return true
    if (!found.enabled) return true
    return found.applyBrandingWatermark
  }

  /**
   * Compute the tier codes a user is entitled to based on their tier's sortOrder.
   * Lower-sortOrder tiers (e.g. FREE=10) include only themselves; higher tiers
   * (e.g. MAX=30) include themselves and every tier below. Single source of truth
   * for both subscription gating and template access (templates store the tier
   * code their consumer must hold).
   */
  async getAllowedTierCodesForUser(userTier: string | null | undefined): Promise<string[]> {
    await this.ensureCache()
    if (!userTier) {
      const lowest = [...this.cache].sort((a, b) => a.sortOrder - b.sortOrder)[0]
      return lowest ? [lowest.code] : []
    }
    const me = this.cache.find((c) => c.code === userTier.toLowerCase())
      ?? this.cache.find((c) => c.code === userTier)
    if (!me) return [userTier]
    return this.cache
      .filter((c) => c.sortOrder <= me.sortOrder)
      .map((c) => c.code)
  }

  async list(): Promise<TierConfigModel[]> {
    return this.repo.find({ order: { sortOrder: 'ASC' } })
  }

  async create(input: {
    code: string
    label: string
    description?: string | null
    applyBrandingWatermark?: boolean
    sortOrder?: number
    enabled?: boolean
  }): Promise<TierConfigModel> {
    const code = input.code.trim().toLowerCase().replace(/\s+/g, '_')
    if (!code) throw new BadRequestException('code is required')
    const existing = await this.repo.findOne({ where: { code } })
    if (existing) throw new BadRequestException(`Tier "${code}" already exists`)
    const created = this.repo.create({
      id: randomUUID(),
      code,
      label: input.label,
      description: input.description ?? null,
      applyBrandingWatermark: input.applyBrandingWatermark ?? false,
      sortOrder: input.sortOrder ?? 100,
      enabled: input.enabled ?? true,
      features: null,
    })
    const saved = await this.repo.save(created)
    await this.reload()
    return saved
  }

  async update(
    id: string,
    input: Partial<{
      label: string
      description: string | null
      applyBrandingWatermark: boolean
      sortOrder: number
      enabled: boolean
      features: Record<string, unknown> | null
    }>,
  ): Promise<TierConfigModel> {
    const row = await this.repo.findOne({ where: { id } })
    if (!row) throw new NotFoundException('Tier not found')
    if (input.label !== undefined) row.label = input.label
    if (input.description !== undefined) row.description = input.description ?? null
    if (input.applyBrandingWatermark !== undefined)
      row.applyBrandingWatermark = input.applyBrandingWatermark
    if (input.sortOrder !== undefined) row.sortOrder = input.sortOrder
    if (input.enabled !== undefined) row.enabled = input.enabled
    if (input.features !== undefined) row.features = input.features
    const saved = await this.repo.save(row)
    await this.reload()
    return saved
  }

  async delete(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } })
    if (!row) throw new NotFoundException('Tier not found')
    // Built-in tier codes cannot be deleted — they're enum values referenced by users
    // and would orphan a lot of data.
    if (SEED.some((s) => s.code === row.code)) {
      throw new BadRequestException(
        `Built-in tier "${row.code}" cannot be deleted. Disable it instead.`,
      )
    }
    await this.repo.softDelete({ id })
    await this.reload()
  }
}
