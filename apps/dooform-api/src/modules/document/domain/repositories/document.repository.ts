import type { IRepository } from '@dooform-api-core/domain'

import type { Document } from '../entities/document.entity'
import type { DocumentLifecycleStatus } from '../enums/document.enum'

export interface DocumentListOptions {
  scope?: 'owned' | 'shared' | 'all'
  lifecycleStatus?: DocumentLifecycleStatus | DocumentLifecycleStatus[]
}

export interface IDocumentRepository extends IRepository<Document> {
  findByUserId(
    userId: string,
    page: number,
    pageSize: number,
    options?: DocumentListOptions,
  ): Promise<{ data: Document[]; total: number }>
}
