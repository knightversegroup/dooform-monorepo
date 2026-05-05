import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import { assertCanReadCollection } from '../../policies/dictionary-access.policy'
import { GetByIdDto } from '../../dtos/get-by-id.dto'

@Injectable()
@UseClassLogger('dictionary')
export class GetCollectionUseCase implements UseCase<GetByIdDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetByIdDto)
  async execute(dto: GetByIdDto): Promise<Result<any>> {
    const collection = await this.repository.findById(dto.id)
    if (!collection) {
      throw new EntityNotFoundException(`Dictionary collection with id ${dto.id} not found`)
    }
    assertCanReadCollection(collection, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })
    const p = collection.getProps()
    return {
      id: collection.id,
      name: p.name,
      description: p.description,
      scope: p.scope,
      status: p.status,
      organizationId: p.organizationId,
      ownerUserId: p.ownerUserId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    } as any
  }
}
