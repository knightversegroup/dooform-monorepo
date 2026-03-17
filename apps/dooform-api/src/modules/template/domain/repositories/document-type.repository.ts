import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentType } from '../entities/document-type.entity'

export interface IDocumentTypeRepository extends IRepository<DocumentType> {
  findByCode(code: string): Promise<DocumentType | null>
  findAll(category?: string, activeOnly?: boolean): Promise<DocumentType[]>
  countTemplatesByDocumentTypeId(documentTypeId: string): Promise<number>
}
