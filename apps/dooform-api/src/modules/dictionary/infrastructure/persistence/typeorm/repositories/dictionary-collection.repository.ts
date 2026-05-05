import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DictionaryCollection,
  type DictionaryCollectionProps,
} from '../../../../domain/entities/dictionary-collection.entity'
import { DictionaryScope, DictionaryStatus } from '../../../../domain/enums/dictionary.enum'
import type {
  IDictionaryCollectionRepository,
  ListDictionaryCollectionsOptions,
} from '../../../../domain/repositories/dictionary-collection.repository'
import { DictionaryCollectionModel } from '../models/dictionary-collection.model'

@Injectable()
export class TypeOrmDictionaryCollectionRepository
  extends BaseTypeOrmRepository<DictionaryCollection, DictionaryCollectionModel>
  implements IDictionaryCollectionRepository
{
  constructor(
    @InjectRepository(DictionaryCollectionModel)
    repository: Repository<DictionaryCollectionModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DictionaryCollectionModel)
  }

  async findVisibleToUser(
    options: ListDictionaryCollectionsOptions,
  ): Promise<{ data: DictionaryCollection[]; total: number }> {
    const qb = this.getRepository().createQueryBuilder('c')

    const isGlobalAdmin = options.callerRole === 'GLOBAL_ADMIN'
    const wantPersonal = options.scope === 'PERSONAL'
    const wantOrg = options.scope === 'ORGANIZATION'
    const wantGlobal = options.scope === 'GLOBAL'

    const personalClause = '(c.scope = :sp AND c.owner_user_id = :uid)'
    const orgClause = '(c.scope = :so AND c.organization_id = :orgId)'
    const globalClauseAdmin = '(c.scope = :sg)'
    const globalClausePublic = '(c.scope = :sg AND c.status = :pub)'
    const globalClause = isGlobalAdmin ? globalClauseAdmin : globalClausePublic

    const params: Record<string, unknown> = {
      sp: DictionaryScope.PERSONAL,
      so: DictionaryScope.ORGANIZATION,
      sg: DictionaryScope.GLOBAL,
      pub: DictionaryStatus.PUBLISHED,
      uid: options.callerUserId,
      orgId: options.callerOrganizationId,
    }

    if (isGlobalAdmin && options.scope == null) {
      qb.where('1=1')
    } else if (wantPersonal) {
      qb.where(personalClause, params)
    } else if (wantOrg) {
      if (!options.callerOrganizationId) return { data: [], total: 0 }
      qb.where(orgClause, params)
    } else if (wantGlobal) {
      qb.where(globalClause, params)
    } else {
      const parts: string[] = [personalClause]
      if (options.callerOrganizationId) parts.push(orgClause)
      parts.push(globalClause)
      qb.where(`(${parts.join(' OR ')})`, params)
    }

    if (options.search) {
      qb.andWhere(
        '(c.name ILIKE :s OR COALESCE(c.description, \'\') ILIKE :s)',
        { s: `%${options.search}%` },
      )
    }

    qb.orderBy('c.name', 'ASC')
      .skip(options.page * options.pageSize)
      .take(options.pageSize)

    const [models, total] = await qb.getManyAndCount()
    return { data: models.map((m) => this.toEntity(m)), total }
  }

  protected toEntity(model: DictionaryCollectionModel): DictionaryCollection {
    const props: DictionaryCollectionProps = {
      id: model.id,
      name: model.name,
      description: model.description,
      scope: model.scope,
      status: model.status,
      organizationId: model.organizationId,
      ownerUserId: model.ownerUserId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DictionaryCollection as any)(props)
  }

  protected toModel(entity: DictionaryCollection): Partial<DictionaryCollectionModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      name: props.name,
      description: props.description ?? null,
      scope: props.scope,
      status: props.status,
      organizationId: props.organizationId,
      ownerUserId: props.ownerUserId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
