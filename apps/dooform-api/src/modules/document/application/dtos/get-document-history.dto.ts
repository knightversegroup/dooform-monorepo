import { Allow, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

import { DocumentLifecycleStatus } from '../../domain/enums/document.enum'

export type DocumentHistoryScope = 'owned' | 'shared' | 'all'

export class GetDocumentHistoryDto {
  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number

  @ApiPropertyOptional({ enum: ['owned', 'shared', 'all'], default: 'all' })
  @IsOptional()
  @IsEnum(['owned', 'shared', 'all'])
  scope?: DocumentHistoryScope

  @ApiPropertyOptional({ enum: DocumentLifecycleStatus, isArray: true })
  @IsOptional()
  lifecycleStatus?: DocumentLifecycleStatus | DocumentLifecycleStatus[]

  // Injected from request context
  @Allow()
  userId!: string
}
