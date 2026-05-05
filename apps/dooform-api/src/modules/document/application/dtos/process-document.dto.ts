import { Allow, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ProcessDocumentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  templateId!: string

  @ApiProperty({ example: { firstName: 'John', lastName: 'Doe' } })
  @IsObject()
  @IsNotEmpty()
  data!: Record<string, string>

  @ApiPropertyOptional({
    example: 'Customer Feedback - John Doe',
    description: 'Display name for the document. Falls back to a timestamped default.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string

  // Injected from request context (not from body)
  @Allow()
  userId!: string

  @Allow()
  userTier!: string

  @Allow()
  organizationId!: string | null
}
