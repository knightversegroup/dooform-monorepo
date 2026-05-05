import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import type { IDictionaryEntryRepository } from '../../../domain/repositories/dictionary-entry.repository'
import { assertCanReadCollection } from '../../policies/dictionary-access.policy'
import { ListEntriesDto } from '../../dtos/list-entries.dto'

@Injectable()
@UseClassLogger('dictionary')
export class ListEntriesUseCase implements UseCase<ListEntriesDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly collections: IDictionaryCollectionRepository,
    @Inject('IDictionaryEntryRepository')
    private readonly entries: IDictionaryEntryRepository,
  ) {}

  @UseResult()
  @ValidateInput(ListEntriesDto)
  async execute(dto: ListEntriesDto): Promise<Result<any>> {
    const collection = await this.collections.findById(dto.collectionId)
    if (!collection) {
      throw new EntityNotFoundException(`Collection ${dto.collectionId} not found`)
    }
    // Read-side gate — entries inherit visibility from their parent collection.
    assertCanReadCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    const page = dto.page ?? 0
    const pageSize = dto.pageSize ?? 100
    const result = await this.entries.findInCollection({
      collectionId: dto.collectionId,
      search: dto.search,
      page,
      pageSize,
    })
    const data = result.data.map((e) => {
      const p = e.getProps()
      return {
        id: e.id,
        collectionId: p.collectionId,
        term: p.term,
        termTh: p.termTh,
        definition: p.definition,
        definitionTh: p.definitionTh,
        tags: p.tags,
        ownerUserId: p.ownerUserId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })
    return { data, total: result.total, page, pageSize } as any
  }
}
