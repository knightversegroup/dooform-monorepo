import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import { DictionaryScope } from '../../../domain/enums/dictionary.enum'
import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import { assertCanEditCollection } from '../../policies/dictionary-access.policy'
import { PublishCollectionDto } from '../../dtos/publish-collection.dto'

@Injectable()
@UseClassLogger('dictionary')
export class PublishCollectionUseCase
  implements UseCase<PublishCollectionDto, { id: string; status: string }>
{
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
  ) {}

  @UseResult()
  @ValidateInput(PublishCollectionDto)
  async execute(dto: PublishCollectionDto): Promise<Result<{ id: string; status: string }>> {
    const collection = await this.repository.findById(dto.id)
    if (!collection) {
      throw new EntityNotFoundException(`Dictionary collection with id ${dto.id} not found`)
    }
    assertCanEditCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })
    if (collection.scope !== DictionaryScope.GLOBAL) {
      // PUBLISHED is the default for personal/org collections — nothing to flip.
      return { id: collection.id, status: collection.status } as any
    }
    if (dto.publish) collection.publish()
    else collection.unpublish()
    const saved = await this.repository.save(collection)
    return { id: saved.id, status: saved.status } as any
  }
}
