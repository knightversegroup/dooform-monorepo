import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetLogsDto {
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  limit?: number

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @IsString()
  @IsOptional()
  method?: string

  @IsString()
  @IsOptional()
  path?: string

  @IsString()
  @IsOptional()
  userId?: string
}
