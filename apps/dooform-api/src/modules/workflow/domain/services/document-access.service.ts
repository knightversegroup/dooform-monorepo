import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { DocumentModel } from '../../../document/infrastructure/persistence/typeorm/models/document.model'
import { ShareRole } from '../enums/workflow.enum'
import type { IDocumentShareRepository } from '../repositories/document-share.repository'

const ROLE_RANK: Record<ShareRole, number> = {
  [ShareRole.OWNER]: 4,
  [ShareRole.EDITOR]: 3,
  [ShareRole.COMMENTER]: 2,
  [ShareRole.VIEWER]: 1,
}

export interface AccessSummary {
  document: DocumentModel
  role: ShareRole | null
  isOwner: boolean
}

/**
 * Domain service that resolves a user's effective access to a document.
 * Spans two aggregates (Document, DocumentShare) so it lives in the domain layer
 * but uses repository ports.
 */
@Injectable()
export class DocumentAccessService {
  constructor(
    @InjectRepository(DocumentModel)
    private readonly documents: Repository<DocumentModel>,
    @Inject('IDocumentShareRepository')
    private readonly shares: IDocumentShareRepository,
  ) {}

  async resolve(documentId: string, userId: string): Promise<AccessSummary> {
    const document = await this.documents.findOne({ where: { id: documentId } })
    if (!document) throw new NotFoundException('Document not found')

    const isOwner = (document.ownerUserId || document.userId) === userId
    if (isOwner) {
      return { document, role: ShareRole.OWNER, isOwner: true }
    }
    const share = await this.shares.findByDocumentAndUser(documentId, userId)
    return { document, role: share?.role ?? null, isOwner: false }
  }

  async require(
    documentId: string,
    userId: string,
    minimum: ShareRole,
  ): Promise<AccessSummary> {
    const summary = await this.resolve(documentId, userId)
    if (!summary.role) {
      throw new ForbiddenException('You do not have access to this document')
    }
    if (ROLE_RANK[summary.role] < ROLE_RANK[minimum]) {
      throw new ForbiddenException(
        `Requires at least ${minimum.toLowerCase()} role on this document`,
      )
    }
    return summary
  }
}
