import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import { assertCanEditCollection } from '../../policies/dictionary-access.policy'
import { DictionaryEntryModel } from '../../../infrastructure/persistence/typeorm/models/dictionary-entry.model'
import { GetByIdDto } from '../../dtos/get-by-id.dto'

@Injectable()
@UseClassLogger('dictionary')
export class DeleteCollectionUseCase implements UseCase<GetByIdDto, { success: boolean }> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
    @InjectRepository(DictionaryEntryModel)
    private readonly entriesRepo: Repository<DictionaryEntryModel>,
  ) {}

  @UseResult()
  @ValidateInput(GetByIdDto)
  async execute(dto: GetByIdDto): Promise<Result<{ success: boolean }>> {
    const collection = await this.repository.findById(dto.id)
    if (!collection) {
      throw new EntityNotFoundException(`Dictionary collection with id ${dto.id} not found`)
    }
    assertCanEditCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })
    // Delete child entries first — there's no FK cascade configured, so we clear them
    // explicitly to avoid orphaned rows.
    await this.entriesRepo.delete({ collectionId: dto.id })
    await this.repository.deleteById(dto.id)
    return { success: true } as any
  }
}
