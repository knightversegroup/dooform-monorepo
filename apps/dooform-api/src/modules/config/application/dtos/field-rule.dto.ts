import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateFieldRuleDto {
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

  @IsString()
  @IsOptional()
  inputType?: string

  @IsString()
  @IsOptional()
  validation?: string

  @IsString()
  @IsOptional()
  options?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateFieldRuleDto {
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

  @IsString()
  @IsOptional()
  inputType?: string

  @IsString()
  @IsOptional()
  validation?: string

  @IsString()
  @IsOptional()
  options?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class TestFieldRuleDto {
  @IsString()
  @IsNotEmpty()
  pattern!: string

  @IsString()
  @IsNotEmpty()
  testString!: string
}

export class GenerateFieldDefinitionsDto {
  @IsArray()
  @IsString({ each: true })
  placeholders!: string[]
}
