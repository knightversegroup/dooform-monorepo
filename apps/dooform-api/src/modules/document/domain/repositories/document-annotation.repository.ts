import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentAnnotation } from '../entities/document-annotation.entity'

export interface IDocumentAnnotationRepository extends IRepository<DocumentAnnotation> {
  findByDocumentAndUser(documentId: string, userId: string): Promise<DocumentAnnotation | null>
  findByDocumentId(documentId: string): Promise<DocumentAnnotation | null>
}
