import type { IRepository } from '@dooform-api-core/domain'

import type { Template } from '../entities/template.entity'

export interface ListTemplatesForOrgOptions {
  organizationId: string | null
  status?: string
  type?: string
  tier?: string
  tiers?: string[]
  category?: string
  search?: string
  documentTypeId?: string
  page: number
  pageSize: number
  // Caller role drives status visibility: non-admins only see PUBLISHED templates
  // outside their own org, plus PUBLISHED GLOBAL templates.
  callerRole?: string
  // Pre-computed permission boolean: holder of `templates:read-cross-org`. Computed
  // by the calling use case (which has PermissionService DI) and passed down so the
  // repository doesn't need its own auth dependency. When undefined the repo falls
  // back to `callerRole === 'GLOBAL_ADMIN'` for backward compatibility.
  canReadCrossOrg?: boolean
  // Public marketing-site path: strictly require visibility=GLOBAL + status=PUBLISHED.
  // No legacy `organizationId IS NULL` fallback — org-scoped rows must never leak out.
  publicOnly?: boolean
}

export interface ITemplateRepository extends IRepository<Template> {
  findByDocumentTypeId(documentTypeId: string): Promise<Template[]>
  /**
   * Returns templates visible to the given organization: their own org-scoped templates
   * plus any GLOBAL templates. Used by the multi-tenant list endpoint.
   */
  findVisibleToOrg(
    options: ListTemplatesForOrgOptions,
  ): Promise<{ data: Template[]; total: number }>
  /** Total count of org-scoped templates (excludes archived). For tier limit enforcement. */
  countForOrg(organizationId: string): Promise<number>
}
