import {
  Allow,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string

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

  @Allow()
  createdByUserId?: string
}
