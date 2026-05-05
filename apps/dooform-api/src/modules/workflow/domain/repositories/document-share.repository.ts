import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentShare } from '../entities/document-share.entity'

export interface IDocumentShareRepository extends IRepository<DocumentShare> {
  findByDocumentId(documentId: string): Promise<DocumentShare[]>
  findByDocumentAndUser(documentId: string, userId: string): Promise<DocumentShare | null>
  findById(id: string): Promise<DocumentShare | null>
  /**
   * Look up a share row regardless of soft-delete state. Used when re-sharing with a
   * user the owner previously revoked: the unique index `(document_id, user_id)` does
   * not consider `deleted_at`, so we must restore the soft-deleted row instead of
   * inserting a duplicate.
   */
  restoreOrCreate(input: {
    documentId: string
    userId: string
    role: string
    grantedBy: string
  }): Promise<{ id: string; documentId: string; userId: string; role: string; restored: boolean }>
}
