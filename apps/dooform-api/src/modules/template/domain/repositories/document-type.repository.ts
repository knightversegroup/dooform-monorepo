import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentType } from '../entities/document-type.entity'

export interface IDocumentTypeRepository extends IRepository<DocumentType> {
  findByCode(code: string): Promise<DocumentType | null>
  findByCategory(category: string): Promise<DocumentType[]>
  findDistinctCategories(): Promise<string[]>
}
