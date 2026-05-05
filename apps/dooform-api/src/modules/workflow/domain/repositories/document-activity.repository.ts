import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentActivity } from '../entities/document-activity.entity'

export interface IDocumentActivityRepository extends IRepository<DocumentActivity> {
  findByDocumentId(
    documentId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: DocumentActivity[]; total: number }>
}
