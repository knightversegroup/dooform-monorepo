import { Allow, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { DocumentFormat } from '../../domain/enums/document.enum'

export class DownloadDocumentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  documentId!: string

  @ApiPropertyOptional({ enum: DocumentFormat, example: DocumentFormat.PDF })
  @IsEnum(DocumentFormat)
  @IsOptional()
  format?: DocumentFormat

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  watermarkPresetId?: string

  // Injected from request context
  @Allow()
  userId!: string

  @Allow()
  userTier!: string

  @Allow()
  organizationId!: string | null
}
