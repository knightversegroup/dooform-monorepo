import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SaveAnnotationsBodyDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['text', 'strikethrough'] },
        pageIndex: { type: 'number' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        content: { type: 'string' },
        fontSize: { type: 'number' },
        fontColor: { type: 'string' },
        color: { type: 'string' },
        lineWidth: { type: 'number' },
      },
    },
    example: [{ id: 'a1', type: 'text', pageIndex: 0, x: 100, y: 200, width: 150, height: 20, content: 'Hello', fontSize: 12, fontColor: '#000000' }],
  })
  data!: any[]

  @ApiProperty({ example: 1, description: 'Expected version for optimistic locking' })
  version!: number
}

export class CreateWatermarkPresetBodyDto {
  @ApiProperty({ example: 'Company Watermark' })
  name!: string

  @ApiProperty({
    example: {
      lines: [{ text: 'CONFIDENTIAL', bold: true, size: 14 }],
      fontColor: '#333333',
      opacity: 0.3,
      rotation: -45,
      position: 'center',
      scope: 'all',
    },
  })
  config!: any
}

export class UpdateWatermarkPresetBodyDto {
  @ApiPropertyOptional({ example: 'Updated Watermark' })
  name?: string

  @ApiPropertyOptional({
    example: {
      lines: [{ text: 'DRAFT', bold: false, size: 12 }],
      opacity: 0.5,
    },
  })
  config?: any
}

export class UpdateBrandingWatermarkBodyDto {
  @ApiProperty({
    example: {
      lines: [{ text: 'Created by Dooform', bold: false, size: 24 }],
      fontColor: '#888888',
      opacity: 0.08,
      rotation: -45,
      position: 'center',
      scope: 'all',
    },
  })
  config!: any
}
