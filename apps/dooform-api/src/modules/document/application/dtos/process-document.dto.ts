import { Allow, IsNotEmpty, IsObject, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ProcessDocumentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  templateId!: string

  @ApiProperty({ example: { firstName: 'John', lastName: 'Doe' } })
  @IsObject()
  @IsNotEmpty()
  data!: Record<string, string>

  // Injected from request context (not from body)
  @Allow()
  userId!: string

  @Allow()
  userTier!: string
}
