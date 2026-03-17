import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateEntityRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  pattern!: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string
}

export class UpdateEntityRuleDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  pattern?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string
}

export class DetectEntityDto {
  @IsString()
  @IsNotEmpty()
  key!: string
}
