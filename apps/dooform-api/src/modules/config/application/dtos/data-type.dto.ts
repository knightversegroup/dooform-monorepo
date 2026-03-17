import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateDataTypeDto {
  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  pattern?: string

  @IsString()
  @IsOptional()
  inputType?: string

  @IsString()
  @IsOptional()
  validation?: string

  @IsString()
  @IsOptional()
  options?: string

  @IsString()
  @IsOptional()
  defaultValue?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateDataTypeDto {
  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  pattern?: string

  @IsString()
  @IsOptional()
  inputType?: string

  @IsString()
  @IsOptional()
  validation?: string

  @IsString()
  @IsOptional()
  options?: string

  @IsString()
  @IsOptional()
  defaultValue?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
