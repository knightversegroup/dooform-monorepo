import type { IRepository } from '@dooform-api-core/domain'

import type { DataType } from '../entities/data-type.entity'

export interface IDataTypeRepository extends IRepository<DataType> {
  findAll(): Promise<DataType[]>
  findById(id: string): Promise<DataType | null>
  findByCode(code: string): Promise<DataType | null>
  countAll(): Promise<number>
}
