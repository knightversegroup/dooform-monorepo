import { IsArray, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BulkAssignTemplatesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentTypeId!: string

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        variantName: { type: 'string' },
        variantOrder: { type: 'number' },
      },
    },
  })
  @IsArray()
  assignments!: Array<{
    templateId: string
    variantName?: string
    variantOrder?: number
  }>
}
