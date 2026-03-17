import type { IRepository, PaginatedResult } from '@dooform-api-core/domain'

import type { Document } from '../entities/document.entity'

export interface IDocumentRepository extends IRepository<Document> {
  findByUserIdPaginated(userId: string, page: number, limit: number): Promise<PaginatedResult<Document>>
  updatePdfPath(id: string, filePathPdf: string): Promise<void>
}
