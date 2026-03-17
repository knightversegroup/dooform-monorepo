import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator'

export class UpdateDocumentTypeDto {
  @IsString()
  @IsOptional()
  code?: string

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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  metadata?: string
}
