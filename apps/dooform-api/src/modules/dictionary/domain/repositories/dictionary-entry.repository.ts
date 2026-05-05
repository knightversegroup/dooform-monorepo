import type { IRepository } from '@dooform-api-core/domain'

import type { DictionaryEntry } from '../entities/dictionary-entry.entity'

export interface ListEntriesInCollectionOptions {
  collectionId: string
  search?: string
  page: number
  pageSize: number
}

export interface IDictionaryEntryRepository extends IRepository<DictionaryEntry> {
  /** All entries inside a single collection (caller-side gates collection visibility first). */
  findInCollection(
    options: ListEntriesInCollectionOptions,
  ): Promise<{ data: DictionaryEntry[]; total: number }>
}
