import type { IRepository } from '@dooform-api-core/domain'

import type { DocumentSignature } from '../entities/document-signature.entity'

export interface IDocumentSignatureRepository extends IRepository<DocumentSignature> {
  findByDocumentId(documentId: string): Promise<DocumentSignature[]>
  findById(id: string): Promise<DocumentSignature | null>
}
