import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

import {
  type FilterCondition,
  type FilterOperator,
  type FilterParams,
  type FilterSearchText,
  type OrderParams,
  type PagingParams,
  type SearchOptions,
} from '../shared'

export class FilterConditionDto<T> implements FilterCondition<T> {
  @IsString()
  field!: keyof T

  @IsString()
  operator!: FilterOperator

  @IsOptional()
  value?: unknown
}

export class SearchPagingDto implements PagingParams {
  @IsNumber()
  @Min(1)
  @Max(200)
  pageSize!: number

  @IsNumber()
  @Min(0)
  currentPage!: number
}

export class SearchOrderDto<T> implements OrderParams<T> {
  @IsString()
  field!: keyof T

  @IsEnum(['ASC', 'DESC'])
  type!: 'ASC' | 'DESC'
}

export class SearchTextDto<T> implements FilterSearchText<T> {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  fields!: (keyof T)[]

  @IsString()
  value!: string
}

export class SearchFilterDto<T> implements FilterParams<T> {
  @Type(() => FilterConditionDto)
  @IsOptional()
  @ValidateNested({ each: true })
  conditions?: FilterCondition<T>[]

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchTextDto)
  searchText?: SearchTextDto<T>
}

export class SearchOptionsInputDto<T> implements SearchOptions<T> {
  @Type(() => SearchFilterDto)
  @IsOptional()
  @ValidateNested()
  filter?: SearchFilterDto<T>

  @Type(() => SearchPagingDto)
  @IsOptional()
  @ValidateNested()
  paging?: SearchPagingDto

  @Type(() => SearchOrderDto)
  @IsOptional()
  @ValidateNested()
  order?: SearchOrderDto<T>
}
