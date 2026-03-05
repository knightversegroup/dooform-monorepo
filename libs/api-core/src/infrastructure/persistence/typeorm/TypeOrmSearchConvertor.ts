import {
  FindManyOptions,
  FindOptionsWhere,
  Equal,
  Not,
  MoreThan,
  MoreThanOrEqual,
  LessThan,
  LessThanOrEqual,
  Like,
  In,
  Between,
  IsNull,
  ILike,
} from 'typeorm'

import type { SearchOptions, FilterCondition } from '../../../shared/Search'

export class TypeOrmSearchConvertor {
  static convert<TEntity, TModel>(
    searchOptions: SearchOptions<TEntity>
  ): FindManyOptions<TModel> {
    const findOptions: FindManyOptions<TModel> = {}

    if (searchOptions.filter) {
      const where: FindOptionsWhere<TModel> = {}

      if (searchOptions.filter.conditions) {
        for (const condition of searchOptions.filter.conditions) {
          const field = condition.field as string
          ;(where as any)[field] = this.convertOperator(condition)
        }
      }

      if (searchOptions.filter.searchText) {
        const { fields, value } = searchOptions.filter.searchText
        if (fields.length === 1) {
          ;(where as any)[fields[0] as string] = ILike(`%${value}%`)
        } else {
          // For multiple fields, use array of where conditions (OR)
          const searchWheres = fields.map((field) => {
            const searchWhere = { ...where } as any
            searchWhere[field as string] = ILike(`%${value}%`)
            return searchWhere
          })
          findOptions.where = searchWheres as any
        }
      }

      if (!findOptions.where) {
        findOptions.where = where as any
      }
    }

    if (searchOptions.paging) {
      const { pageSize, currentPage } = searchOptions.paging
      findOptions.take = pageSize
      findOptions.skip = currentPage * pageSize
    }

    if (searchOptions.order) {
      const { field, type } = searchOptions.order
      findOptions.order = {
        [field as string]: type,
      } as any
    }

    return findOptions
  }

  private static convertOperator<T>(condition: FilterCondition<T>): any {
    const { operator, value } = condition

    switch (operator) {
      case 'eq':
        return Equal(value)
      case 'neq':
        return Not(Equal(value))
      case 'gt':
        return MoreThan(value)
      case 'gte':
        return MoreThanOrEqual(value)
      case 'lt':
        return LessThan(value)
      case 'lte':
        return LessThanOrEqual(value)
      case 'like':
        return ILike(`%${value}%`)
      case 'in':
        return In(value as any[])
      case 'notIn':
        return Not(In(value as any[]))
      case 'between': {
        const [min, max] = value as [any, any]
        return Between(min, max)
      }
      case 'isNull':
        return IsNull()
      case 'isNotNull':
        return Not(IsNull())
      default:
        return Equal(value)
    }
  }
}
