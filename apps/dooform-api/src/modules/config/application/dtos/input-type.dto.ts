import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateInputTypeDto {
  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateInputTypeDto {
  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @IsOptional()
  priority?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
