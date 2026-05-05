import { Allow, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ListCollectionsDto {
  @ApiPropertyOptional({ enum: ['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'] })
  @IsOptional()
  @IsEnum(['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'] as any)
  scope?: 'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  pageSize?: number

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
