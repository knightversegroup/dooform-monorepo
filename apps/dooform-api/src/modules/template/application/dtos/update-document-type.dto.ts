import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateDocumentTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nameEN?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number
}
