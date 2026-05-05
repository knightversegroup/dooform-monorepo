import { Allow, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RenameDocumentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  documentId!: string

  @ApiProperty({ example: 'Customer Feedback - Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename!: string

  // Injected from request context
  @Allow()
  userId!: string
}
