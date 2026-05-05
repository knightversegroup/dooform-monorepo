import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import {
  assertCanCreateInScope,
  assertCanEditCollection,
} from '../../policies/dictionary-access.policy'
import { UpdateCollectionDto } from '../../dtos/update-collection.dto'

@Injectable()
@UseClassLogger('dictionary')
export class UpdateCollectionUseCase implements UseCase<UpdateCollectionDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateCollectionDto)
  async execute(dto: UpdateCollectionDto): Promise<Result<any>> {
    const collection = await this.repository.findById(dto.id)
    if (!collection) {
      throw new EntityNotFoundException(`Dictionary collection with id ${dto.id} not found`)
    }

    assertCanEditCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    if (dto.name !== undefined) collection.updateName(dto.name)
    if (dto.description !== undefined) collection.updateDescription(dto.description ?? null)
    if (dto.scope !== undefined && dto.scope !== collection.scope) {
      assertCanCreateInScope(dto.scope, {
        callerRole: dto.callerRole,
        callerOrganizationId: dto.callerOrganizationId,
        callerUserId: dto.callerUserId,
      })
      collection.changeScope(dto.scope, dto.callerOrganizationId ?? null)
    }

    const saved = await this.repository.save(collection)
    const p = saved.getProps()
    return {
      id: saved.id,
      name: p.name,
      description: p.description,
      scope: p.scope,
      status: p.status,
      organizationId: p.organizationId,
      ownerUserId: p.ownerUserId,
      updatedAt: p.updatedAt,
    } as any
  }
}
