import { Allow, IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { AnnotationItem } from '../../domain/entities/document-annotation.entity'

export class SaveAnnotationsDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  documentId!: string

  @ApiProperty({ type: 'array' })
  @IsArray()
  data!: AnnotationItem[]

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  version!: number

  // Injected from request context
  @Allow()
  userId!: string
}
