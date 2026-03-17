import type { IRepository } from '@dooform-api-core/domain'

import type { Template } from '../entities/template.entity'

export interface ITemplateRepository extends IRepository<Template> {
  findWithFilter(filter: TemplateFilter): Promise<Template[]>
  findGroupedByDocumentType(): Promise<{ documentTypeId: string | null; templates: Template[] }[]>
  findOrphanTemplates(): Promise<Template[]>
}

export interface TemplateFilter {
  documentTypeId?: string
  type?: string
  tier?: string
  category?: string
  isVerified?: boolean
  search?: string
  includeDocumentType?: boolean
  sort?: string
  limit?: number
}
