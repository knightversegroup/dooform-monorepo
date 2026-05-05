import { Allow, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegenerateDocumentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  documentId!: string

  /**
   * Optional override for the form data. When present, the new document uses this
   * payload (re-running docxtemplater) instead of the source document's stored data.
   * The source document is left untouched.
   */
  @ApiPropertyOptional({ example: { firstName: 'Jane', lastName: 'Doe' } })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>

  @ApiPropertyOptional({ example: 'Customer Feedback - Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string

  // Injected from request context
  @Allow()
  userId!: string

  @Allow()
  userTier!: string
}
