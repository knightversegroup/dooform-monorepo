import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import type { IDictionaryEntryRepository } from '../../../domain/repositories/dictionary-entry.repository'
import { assertCanEditCollection } from '../../policies/dictionary-access.policy'
import { GetByIdDto } from '../../dtos/get-by-id.dto'

@Injectable()
@UseClassLogger('dictionary')
export class DeleteEntryUseCase implements UseCase<GetByIdDto, { success: boolean }> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly collections: IDictionaryCollectionRepository,
    @Inject('IDictionaryEntryRepository')
    private readonly entries: IDictionaryEntryRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetByIdDto)
  async execute(dto: GetByIdDto): Promise<Result<{ success: boolean }>> {
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
    await this.entries.deleteById(dto.id)
    return { success: true } as any
  }
}
