import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AssignTemplateToDocumentTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentTypeId!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId!: string

  @ApiPropertyOptional({ example: 'Standard' })
  @IsString()
  @IsOptional()
  variantName?: string

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  variantOrder?: number
}
