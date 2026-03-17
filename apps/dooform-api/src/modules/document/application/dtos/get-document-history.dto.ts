import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetDocumentHistoryDto {
  @IsString()
  @IsNotEmpty()
  userId!: string

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number
}
