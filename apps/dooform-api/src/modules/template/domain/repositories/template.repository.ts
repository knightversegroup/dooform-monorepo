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
}
