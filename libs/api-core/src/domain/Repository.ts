import type { SearchOptions } from '../shared/Search'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface IRepository<TEntity> {
  findById(id: string): Promise<TEntity | null>
  findOne(conditions: Record<string, unknown>): Promise<TEntity | null>
  findMany(conditions: Record<string, unknown>): Promise<TEntity[]>
  findAll(): Promise<TEntity[]>
  save(entity: TEntity): Promise<TEntity>
  deleteById(id: string): Promise<void>
  deleteByIds(ids: string[]): Promise<void>
  bulkSave(entities: TEntity[]): Promise<TEntity[]>
  exists(id: string): Promise<boolean>
  count(conditions?: Record<string, unknown>): Promise<number>
  countAll(): Promise<number>
  findWithSearchOptions(searchOptions: SearchOptions<TEntity>): Promise<PaginatedResult<TEntity>>
}
