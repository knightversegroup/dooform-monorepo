import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentComment } from '../entities/document-comment.entity'

export interface IDocumentCommentRepository extends IRepository<DocumentComment> {
  findByDocumentId(documentId: string): Promise<DocumentComment[]>
  findById(id: string): Promise<DocumentComment | null>
}
