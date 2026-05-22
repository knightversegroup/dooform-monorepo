import { Entity, Column, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { UserTier } from '../../../../../document/domain/enums/document.enum'

// Default per-tenant quota: 5 GB. Overridden per-org via the admin /admin/tenants UI.
const DEFAULT_QUOTA_BYTES = 5 * 1024 * 1024 * 1024

@Entity('organizations')
@Index('idx_organizations_slug', ['slug'], { unique: true })
export class OrganizationModel extends BaseTypeOrmModel {
  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 100 })
  slug!: string

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId!: string | null

  // Storage quota (bytes). null = unlimited (GLOBAL_ADMIN may explicitly clear).
  @Column({
    name: 'storage_quota_bytes',
    type: 'bigint',
    nullable: true,
    default: DEFAULT_QUOTA_BYTES,
    transformer: {
      to: (v: number | null | undefined) => v ?? null,
      from: (v: string | null) => (v == null ? null : parseInt(v, 10)),
    },
  })
  storageQuotaBytes!: number | null

  // Live counter, maintained by StorageQuotaService on every save/delete. Reconciled
  // from authoritative file sizes via a periodic recompute job (not yet implemented).
  @Column({
    name: 'storage_used_bytes',
    type: 'bigint',
    default: 0,
    transformer: {
      to: (v: number | null | undefined) => v ?? 0,
      from: (v: string | null) => (v == null ? 0 : parseInt(v, 10)),
    },
  })
  storageUsedBytes!: number

  // Subscription tier for the entire tenant. New members inherit this. Tier-gated
  // features (e.g. branding watermark removal, premium templates) read this value.
  // Stored as varchar (not pg enum) so adding tier codes via tier_configs requires
  // no enum-alter migration. See TierConfigService for the boot-time migration that
  // converted the legacy pg-enum column on existing deployments.
  @Column({ type: 'varchar', length: 32, default: UserTier.FREE })
  tier!: UserTier
}
