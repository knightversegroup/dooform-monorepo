import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDocumentTypeDto {
  @ApiProperty({ example: 'passport' })
  @IsString()
  @IsNotEmpty()
  code!: string

  @ApiProperty({ example: 'หนังสือเดินทาง' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiPropertyOptional({ example: 'Passport' })
  @IsString()
  @IsOptional()
  nameEN?: string

  @ApiPropertyOptional({ example: 'Passport application form' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'identification' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiPropertyOptional({ example: 'passport-icon' })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsString()
  @IsOptional()
  color?: string

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  sortOrder?: number
}
