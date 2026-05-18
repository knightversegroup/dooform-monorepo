import { ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IStorageService } from '../../../document/domain/services/storage.service'
import { OrganizationModel } from '../../infrastructure/persistence/typeorm/models/organization.model'

/**
 * Tracks per-tenant storage usage and enforces quotas.
 *
 * Usage flow:
 *   - Before any upload, the use case calls `assertCanWrite(orgId, sizeBytes)`. If the
 *     write would push the org over its quota, this throws 403.
 *   - After a successful save, the use case calls `recordWrite(orgId, sizeBytes)`.
 *   - On delete, the use case calls `recordDelete(orgId, sizeBytes)`.
 *
 * The counter is best-effort (not transactional with the storage backend), so a
 * `recompute(orgId)` recovery is provided to rebuild from the authoritative file sizes
 * stored on documents/templates rows.
 */
@Injectable()
export class StorageQuotaService {
  private readonly logger = new Logger(StorageQuotaService.name)

  constructor(
    @InjectRepository(OrganizationModel)
    private readonly organizations: Repository<OrganizationModel>,
    @Inject('IStorageService')
    private readonly storage: IStorageService,
  ) {}

  async getUsage(orgId: string): Promise<{
    organizationId: string
    name: string
    slug: string
    quotaBytes: number | null
    usedBytes: number
    percentUsed: number | null
  }> {
    const org = await this.organizations.findOne({ where: { id: orgId } })
    if (!org) throw new NotFoundException('Organization not found')
    return {
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
      quotaBytes: org.storageQuotaBytes,
      usedBytes: org.storageUsedBytes,
      percentUsed:
        org.storageQuotaBytes && org.storageQuotaBytes > 0
          ? Math.min(100, (org.storageUsedBytes / org.storageQuotaBytes) * 100)
          : null,
    }
  }

  async listAllUsage() {
    const orgs = await this.organizations.find({ order: { name: 'ASC' } })
    // Pull member counts in a single grouped query to avoid N+1.
    const counts = await this.organizations.manager
      .createQueryBuilder()
      .select('user.organization_id', 'orgId')
      .addSelect('COUNT(*)', 'count')
      .from('users', 'user')
      .where('user.organization_id IS NOT NULL')
      .groupBy('user.organization_id')
      .getRawMany<{ orgId: string; count: string }>()
    const countByOrg = new Map(counts.map((row) => [row.orgId, Number(row.count)]))
    return orgs.map((org) => ({
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
      quotaBytes: org.storageQuotaBytes,
      usedBytes: org.storageUsedBytes,
      percentUsed:
        org.storageQuotaBytes && org.storageQuotaBytes > 0
          ? Math.min(100, (org.storageUsedBytes / org.storageQuotaBytes) * 100)
          : null,
      memberCount: countByOrg.get(org.id) ?? 0,
      tier: org.tier,
      createdAt: org.createdAt,
    }))
  }

  async setQuota(orgId: string, quotaBytes: number | null): Promise<void> {
    if (quotaBytes !== null && quotaBytes < 0) {
      throw new ForbiddenException('Quota must be non-negative or null (unlimited)')
    }
    const result = await this.organizations.update({ id: orgId }, { storageQuotaBytes: quotaBytes })
    if (!result.affected) throw new NotFoundException('Organization not found')
  }

  async assertCanWrite(orgId: string | null, sizeBytes: number): Promise<void> {
    if (!orgId || sizeBytes <= 0) return
    const org = await this.organizations.findOne({ where: { id: orgId } })
    if (!org) return
    if (org.storageQuotaBytes === null) return // unlimited
    if (org.storageUsedBytes + sizeBytes > org.storageQuotaBytes) {
      throw new ForbiddenException(
        `Storage quota exceeded. Used ${org.storageUsedBytes} / ${org.storageQuotaBytes} bytes; ` +
          `this upload (${sizeBytes} bytes) would exceed the limit.`,
      )
    }
  }

  async recordWrite(orgId: string | null, sizeBytes: number): Promise<void> {
    if (!orgId || sizeBytes <= 0) return
    await this.organizations.increment({ id: orgId }, 'storageUsedBytes', sizeBytes)
  }

  async recordDelete(orgId: string | null, sizeBytes: number): Promise<void> {
    if (!orgId || sizeBytes <= 0) return
    // Use a raw clamped update so concurrent decrements can't drive the counter negative.
    await this.organizations
      .createQueryBuilder()
      .update(OrganizationModel)
      .set({ storageUsedBytes: () => `GREATEST(storage_used_bytes - ${Math.floor(sizeBytes)}, 0)` })
      .where('id = :id', { id: orgId })
      .execute()
  }

  /**
   * Reconcile the cached counter against the authoritative size on the storage backend.
   *
   * The fast quota check uses `storage_used_bytes`, a Postgres counter incremented on
   * every save. That counter can drift if a save succeeds but the increment fails,
   * if a delete happens out-of-band, or if files are written by some path that
   * doesn't go through `recordWrite`. This method walks every object under the
   * tenant's prefix in the configured `IStorageService` (LocalStorageService in dev,
   * AzureBlobStorageService in prod) and rewrites the counter to match reality.
   *
   * Run it from the admin tenants page when a tenant's number looks wrong, or wire
   * it into a nightly cron via `@Cron` for self-healing.
   */
  async recompute(orgId: string): Promise<{ usedBytes: number }> {
    const org = await this.organizations.findOne({ where: { id: orgId } })
    if (!org) throw new NotFoundException('Organization not found')
    const used = await this.storage.getTotalSize(`orgs/${orgId}/`)
    await this.organizations.update({ id: orgId }, { storageUsedBytes: used })
    this.logger.log(`Recomputed usage for org ${orgId} (${org.slug}): ${used} bytes`)
    return { usedBytes: used }
  }
}
