import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import { DictionaryEntry } from '../../../domain/entities/dictionary-entry.entity'
import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import type { IDictionaryEntryRepository } from '../../../domain/repositories/dictionary-entry.repository'
import { assertCanEditCollection } from '../../policies/dictionary-access.policy'
import { CreateEntryDto } from '../../dtos/create-entry.dto'

@Injectable()
@UseClassLogger('dictionary')
export class CreateEntryUseCase implements UseCase<CreateEntryDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly collections: IDictionaryCollectionRepository,
    @Inject('IDictionaryEntryRepository')
    private readonly entries: IDictionaryEntryRepository,
  ) {}

  @UseResult()
  @ValidateInput(CreateEntryDto)
  async execute(dto: CreateEntryDto): Promise<Result<any>> {
    const collection = await this.collections.findById(dto.collectionId)
    if (!collection) {
      throw new EntityNotFoundException(`Collection ${dto.collectionId} not found`)
    }
    // Edit-side gate: only owners (per the collection's scope) can add entries.
    assertCanEditCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })
    if (!dto.callerUserId) {
      throw new Error('callerUserId is required')
    }
    const entry = DictionaryEntry.create({
      collectionId: dto.collectionId,
      term: dto.term,
      termTh: dto.termTh ?? null,
      definition: dto.definition,
      definitionTh: dto.definitionTh ?? null,
      tags: dto.tags ?? null,
      ownerUserId: dto.callerUserId,
    })
    const saved = await this.entries.save(entry)
    const p = saved.getProps()
    return {
      id: saved.id,
      collectionId: p.collectionId,
      term: p.term,
      termTh: p.termTh,
      definition: p.definition,
      definitionTh: p.definitionTh,
      tags: p.tags,
      ownerUserId: p.ownerUserId,
      createdAt: p.createdAt,
    } as any
  }
}
