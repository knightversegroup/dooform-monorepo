import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import type { IDictionaryEntryRepository } from '../../../domain/repositories/dictionary-entry.repository'
import { assertCanEditCollection } from '../../policies/dictionary-access.policy'
import { UpdateEntryDto } from '../../dtos/update-entry.dto'

@Injectable()
@UseClassLogger('dictionary')
export class UpdateEntryUseCase implements UseCase<UpdateEntryDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly collections: IDictionaryCollectionRepository,
    @Inject('IDictionaryEntryRepository')
    private readonly entries: IDictionaryEntryRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateEntryDto)
  async execute(dto: UpdateEntryDto): Promise<Result<any>> {
    const entry = await this.entries.findById(dto.id)
    if (!entry) {
      throw new EntityNotFoundException(`Entry ${dto.id} not found`)
    }
    const collection = await this.collections.findById(entry.collectionId)
    if (!collection) {
      throw new EntityNotFoundException(`Collection ${entry.collectionId} not found`)
    }
    assertCanEditCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    if (dto.term !== undefined) entry.updateTerm(dto.term)
    if (dto.termTh !== undefined) entry.updateTermTh(dto.termTh ?? null)
    if (dto.definition !== undefined) entry.updateDefinition(dto.definition)
    if (dto.definitionTh !== undefined) entry.updateDefinitionTh(dto.definitionTh ?? null)
    if (dto.tags !== undefined) entry.updateTags(dto.tags ?? null)

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
      updatedAt: p.updatedAt,
    } as any
  }
}
