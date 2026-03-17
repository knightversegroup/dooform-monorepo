import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateDocumentTypeDto {
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
  @IsOptional()
  originalSource?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsString()
  @IsOptional()
  color?: string

  @IsInt()
  @IsOptional()
  sortOrder?: number

  @IsString()
  @IsOptional()
  metadata?: string
}
