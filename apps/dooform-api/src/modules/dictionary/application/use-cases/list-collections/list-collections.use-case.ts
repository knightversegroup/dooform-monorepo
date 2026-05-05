import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { IDictionaryCollectionRepository } from '../../../domain/repositories/dictionary-collection.repository'
import { ListCollectionsDto } from '../../dtos/list-collections.dto'

@Injectable()
@UseClassLogger('dictionary')
export class ListCollectionsUseCase implements UseCase<ListCollectionsDto, any> {
  constructor(
    @Inject('IDictionaryCollectionRepository')
    private readonly repository: IDictionaryCollectionRepository,
  ) {}

  @UseResult()
  async execute(dto: ListCollectionsDto): Promise<Result<any>> {
    const page = dto.page ?? 0
    const pageSize = dto.pageSize ?? 50
    const result = await this.repository.findVisibleToUser({
      callerUserId: dto.callerUserId ?? '',
      callerOrganizationId: dto.callerOrganizationId ?? null,
      callerRole: dto.callerRole,
      scope: dto.scope,
      search: dto.search,
      page,
      pageSize,
    })
    const data = result.data.map((c) => {
      const p = c.getProps()
      return {
        id: c.id,
        name: p.name,
        description: p.description,
        scope: p.scope,
        status: p.status,
        organizationId: p.organizationId,
        ownerUserId: p.ownerUserId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })
    return { data, total: result.total, page, pageSize } as any
  }
}
