import type { IRepository } from '@dooform-api-core/domain'

import type { Document } from '../entities/document.entity'

export interface IDocumentRepository extends IRepository<Document> {
  findByUserId(userId: string, page: number, pageSize: number): Promise<{ data: Document[]; total: number }>
}
