import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DataType, type DataTypeProps } from '../../../../domain/entities/data-type.entity'
import type { IDataTypeRepository } from '../../../../domain/repositories/data-type.repository'
import { DataTypeModel } from '../models/data-type.model'

@Injectable()
export class TypeOrmDataTypeRepository
  extends BaseTypeOrmRepository<DataType, DataTypeModel>
  implements IDataTypeRepository
{
  constructor(
    @InjectRepository(DataTypeModel)
    repository: Repository<DataTypeModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DataTypeModel)
  }

  async findAll(): Promise<DataType[]> {
    const rows = await this.getRepository().find({
      order: { sortOrder: 'ASC', label: 'ASC' },
    })
    return rows.map((m) => this.toEntity(m))
  }

  async findById(id: string): Promise<DataType | null> {
    const row = await this.getRepository().findOne({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByCode(code: string): Promise<DataType | null> {
    const row = await this.getRepository().findOne({ where: { code } })
    return row ? this.toEntity(row) : null
  }

  async countAll(): Promise<number> {
    return this.getRepository().count()
  }

  protected toEntity(model: DataTypeModel): DataType {
    const props: DataTypeProps = {
      id: model.id,
      code: model.code,
      label: model.label,
      defaultInputType: model.defaultInputType,
      description: model.description,
      options: model.options,
      defaultValue: model.defaultValue,
      suggestedValues: model.suggestedValues,
      sortOrder: model.sortOrder ?? 0,
      isBuiltIn: !!model.isBuiltIn,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DataType as any)(props)
  }

  protected toModel(entity: DataType): Partial<DataTypeModel> {
    const p = entity.getProps()
    return {
      id: entity.id,
      code: p.code,
      label: p.label,
      defaultInputType: p.defaultInputType,
      description: p.description ?? null,
      options: p.options ?? null,
      defaultValue: p.defaultValue ?? null,
      suggestedValues: p.suggestedValues ?? null,
      sortOrder: p.sortOrder ?? 0,
      isBuiltIn: !!p.isBuiltIn,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
    }
  }
}
