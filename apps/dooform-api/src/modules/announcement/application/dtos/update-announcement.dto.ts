import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class UpdateAnnouncementDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  linkUrl?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkText?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationId?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  startsAt?: Date | null

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  endsAt?: Date | null
}
