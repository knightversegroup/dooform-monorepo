import type { IRepository } from '@dooform-api-core/domain'

import type { Template } from '../entities/template.entity'

export interface ITemplateRepository extends IRepository<Template> {
  findByDocumentTypeId(documentTypeId: string): Promise<Template[]>
}
