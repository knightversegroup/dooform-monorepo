import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20

  @IsOptional()
  @IsString()
  search?: string
}

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  role_name!: string
}

export class SetQuotaDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount!: number

  @IsOptional()
  @IsString()
  reason?: string
}

export class AddQuotaDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount!: number

  @IsOptional()
  @IsString()
  reason?: string
}
