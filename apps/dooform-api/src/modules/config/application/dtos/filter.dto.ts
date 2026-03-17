import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateFilterCategoryDto {
  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  nameEn?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  fieldName!: string

  @IsInt()
  @IsOptional()
  sortOrder?: number
}

export class UpdateFilterCategoryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  nameEn?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  fieldName?: string

  @IsInt()
  @IsOptional()
  sortOrder?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class CreateFilterOptionDto {
  @IsString()
  @IsNotEmpty()
  filterCategoryId!: string

  @IsString()
  @IsNotEmpty()
  value!: string

  @IsString()
  @IsNotEmpty()
  label!: string

  @IsString()
  @IsOptional()
  labelEn?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsInt()
  @IsOptional()
  sortOrder?: number

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}

export class UpdateFilterOptionDto {
  @IsString()
  @IsOptional()
  value?: string

  @IsString()
  @IsOptional()
  label?: string

  @IsString()
  @IsOptional()
  labelEn?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsInt()
  @IsOptional()
  sortOrder?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
