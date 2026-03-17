import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class DataTypeInfoDto {
  @IsString()
  code!: string

  @IsString()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  pattern?: string
}

export class SuggestFieldTypesDto {
  @IsString()
  @IsOptional()
  html_content?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  placeholders?: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataTypeInfoDto)
  @IsOptional()
  data_types?: DataTypeInfoDto[]
}
