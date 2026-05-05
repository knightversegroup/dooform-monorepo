import type { IRepository } from '@dooform-api-core/domain'

import type { DictionaryCollection } from '../entities/dictionary-collection.entity'

export type DictionaryScopeFilter = 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL' | 'ALL'

export interface ListDictionaryCollectionsOptions {
  callerUserId: string
  callerOrganizationId: string | null
  callerRole?: string
  scope?: DictionaryScopeFilter
  search?: string
  page: number
  pageSize: number
}

export interface IDictionaryCollectionRepository extends IRepository<DictionaryCollection> {
  /**
   * Visibility:
   *  - PERSONAL: only the owner.
   *  - ORGANIZATION: anyone in the same org.
   *  - GLOBAL: any authenticated user, but only when status=PUBLISHED.
   *  - GLOBAL_ADMIN bypass: see everything.
   */
  findVisibleToUser(
    options: ListDictionaryCollectionsOptions,
  ): Promise<{ data: DictionaryCollection[]; total: number }>
}
