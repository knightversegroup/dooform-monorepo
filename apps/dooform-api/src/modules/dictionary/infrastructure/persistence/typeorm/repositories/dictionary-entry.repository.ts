import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DictionaryEntry,
  type DictionaryEntryProps,
} from '../../../../domain/entities/dictionary-entry.entity'
import type {
  IDictionaryEntryRepository,
  ListEntriesInCollectionOptions,
} from '../../../../domain/repositories/dictionary-entry.repository'
import { DictionaryEntryModel } from '../models/dictionary-entry.model'

@Injectable()
export class TypeOrmDictionaryEntryRepository
  extends BaseTypeOrmRepository<DictionaryEntry, DictionaryEntryModel>
  implements IDictionaryEntryRepository
{
  constructor(
    @InjectRepository(DictionaryEntryModel)
    repository: Repository<DictionaryEntryModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DictionaryEntryModel)
  }

  async findInCollection(
    options: ListEntriesInCollectionOptions,
  ): Promise<{ data: DictionaryEntry[]; total: number }> {
    const qb = this.getRepository().createQueryBuilder('e')
    qb.where('e.collection_id = :cid', { cid: options.collectionId })
    if (options.search) {
      qb.andWhere(
        '(e.term ILIKE :s OR COALESCE(e.term_th, \'\') ILIKE :s OR e.definition ILIKE :s OR COALESCE(e.definition_th, \'\') ILIKE :s)',
        { s: `%${options.search}%` },
      )
    }
    qb.orderBy('e.term', 'ASC')
      .skip(options.page * options.pageSize)
      .take(options.pageSize)

    const [models, total] = await qb.getManyAndCount()
    return { data: models.map((m) => this.toEntity(m)), total }
  }

  protected toEntity(model: DictionaryEntryModel): DictionaryEntry {
    const props: DictionaryEntryProps = {
      id: model.id,
      collectionId: model.collectionId,
      term: model.term,
      termTh: model.termTh,
      definition: model.definition,
      definitionTh: model.definitionTh,
      tags: model.tags,
      ownerUserId: model.ownerUserId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DictionaryEntry as any)(props)
  }

  protected toModel(entity: DictionaryEntry): Partial<DictionaryEntryModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      collectionId: props.collectionId,
      ownerUserId: props.ownerUserId,
      term: props.term,
      termTh: props.termTh ?? null,
      definition: props.definition,
      definitionTh: props.definitionTh ?? null,
      tags: props.tags ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
