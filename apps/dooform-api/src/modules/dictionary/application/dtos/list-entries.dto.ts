import { Allow, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ListEntriesDto {
  @IsUUID()
  @IsNotEmpty()
  collectionId!: string

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

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  pageSize?: number

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
