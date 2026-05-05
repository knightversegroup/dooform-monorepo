import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import { DictionaryCollection } from '../../../domain/entities/dictionary-collection.entity'
import { DictionaryScope } from '../../../domain/enums/dictionary.enum'
import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import { assertCanCreateInScope } from '../../policies/dictionary-access.policy'
import { CreateCollectionDto } from '../../dtos/create-collection.dto'

@Injectable()
@UseClassLogger('dictionary')
export class CreateCollectionUseCase implements UseCase<CreateCollectionDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
  ) {}

  @UseResult()
  @ValidateInput(CreateCollectionDto)
  async execute(dto: CreateCollectionDto): Promise<Result<any>> {
    assertCanCreateInScope(dto.scope, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
    })

    if (!dto.callerUserId) {
      throw new Error('callerUserId is required to create a dictionary collection')
    }

    const orgId = dto.scope === DictionaryScope.ORGANIZATION ? dto.callerOrganizationId ?? null : null

    const collection = DictionaryCollection.create({
      name: dto.name,
      description: dto.description ?? null,
      scope: dto.scope,
      organizationId: orgId,
      ownerUserId: dto.callerUserId,
    })

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
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    } as any
  }
}
