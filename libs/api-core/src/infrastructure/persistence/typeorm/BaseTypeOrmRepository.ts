import {
  Repository,
  EntityManager,
  type ObjectLiteral,
  type EntityTarget,
  type FindOptionsWhere,
} from 'typeorm'

import type { IUnitOfWork } from '../../../application/UnitOfWork'
import type { IRepository, PaginatedResult } from '../../../domain/Repository'
import type { SearchOptions } from '../../../shared/Search'

import type { BaseTypeOrmModel } from './BaseTypeOrmModel'
import { TypeOrmSearchConvertor } from './TypeOrmSearchConvertor'

export abstract class BaseTypeOrmRepository<TEntity, TModel extends BaseTypeOrmModel & ObjectLiteral>
  implements IRepository<TEntity>
{
  constructor(
    protected readonly repository: Repository<TModel>,
    protected readonly unitOfWork: IUnitOfWork,
    protected readonly entityTarget: EntityTarget<TModel>
  ) {}

  protected abstract toEntity(model: TModel): TEntity
  protected abstract toModel(entity: TEntity): Partial<TModel>

  protected getManager(): EntityManager {
    const transaction = this.unitOfWork.getCurrentTransaction()
    if (transaction) {
      return transaction.getTransactionInstance() as EntityManager
    }
    return this.repository.manager
  }

  protected getRepository(): Repository<TModel> {
    const manager = this.getManager()
    return manager.getRepository(this.entityTarget)
  }

  async findById(id: string): Promise<TEntity | null> {
    const model = await this.getRepository().findOne({
      where: { id } as FindOptionsWhere<TModel>,
    })
    return model ? this.toEntity(model) : null
  }

  async findOne(conditions: Record<string, unknown>): Promise<TEntity | null> {
    const model = await this.getRepository().findOne({
      where: conditions as FindOptionsWhere<TModel>,
    })
    return model ? this.toEntity(model) : null
  }

  async findMany(conditions: Record<string, unknown>): Promise<TEntity[]> {
    const models = await this.getRepository().find({
      where: conditions as FindOptionsWhere<TModel>,
    })
    return models.map((model) => this.toEntity(model))
  }

  async findAll(): Promise<TEntity[]> {
    const models = await this.getRepository().find()
    return models.map((model) => this.toEntity(model))
  }

  async save(entity: TEntity): Promise<TEntity> {
    const modelData = this.toModel(entity)
    const saved = await this.getRepository().save(modelData as any)
    return this.toEntity(saved)
  }

  async deleteById(id: string): Promise<void> {
    await this.getRepository().softDelete(id)
  }

  async deleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    await this.getRepository().softDelete(ids)
  }

  async bulkSave(entities: TEntity[]): Promise<TEntity[]> {
    const modelDataList = entities.map((entity) => this.toModel(entity))
    const saved = await this.getRepository().save(modelDataList as any[])
    return saved.map((model) => this.toEntity(model))
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.getRepository().count({
      where: { id } as FindOptionsWhere<TModel>,
    })
    return count > 0
  }

  async count(conditions?: Record<string, unknown>): Promise<number> {
    if (!conditions) {
      return this.getRepository().count()
    }
    return this.getRepository().count({
      where: conditions as FindOptionsWhere<TModel>,
    })
  }

  async countAll(): Promise<number> {
    return this.getRepository().count()
  }

  async findWithSearchOptions(
    searchOptions: SearchOptions<TEntity>
  ): Promise<PaginatedResult<TEntity>> {
    const findOptions = TypeOrmSearchConvertor.convert<TEntity, TModel>(searchOptions)

    const [models, total] = await this.getRepository().findAndCount(findOptions)

    const page = searchOptions.paging?.currentPage ?? 0
    const pageSize = searchOptions.paging?.pageSize ?? total
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1

    return {
      data: models.map((model) => this.toEntity(model)),
      total,
      page,
      totalPages,
    }
  }
}
