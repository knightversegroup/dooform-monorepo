export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'notIn'
  | 'between'
  | 'isNull'
  | 'isNotNull'

export enum FilterOperatorEnum {
  EQUAL = 'eq',
  NOT_EQUAL = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  LIKE = 'like',
  IN = 'in',
  NOT_IN = 'notIn',
  BETWEEN = 'between',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export interface FilterCondition<T> {
  field: keyof T
  operator: FilterOperator
  value?: unknown
}

export interface FilterSearchText<T> {
  fields: (keyof T)[]
  value: string
}

export interface FilterParams<T> {
  conditions?: FilterCondition<T>[]
  searchText?: FilterSearchText<T>
}

export interface PagingParams {
  pageSize: number
  currentPage: number
}

export interface OrderParams<T> {
  field: keyof T
  type: 'ASC' | 'DESC'
}

export interface SearchOptions<T> {
  filter?: FilterParams<T>
  paging?: PagingParams
  order?: OrderParams<T>
}
