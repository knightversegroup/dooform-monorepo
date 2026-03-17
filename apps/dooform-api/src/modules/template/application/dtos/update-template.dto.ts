import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  displayName?: string

  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  author?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  originalSource?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean

  @IsBoolean()
  @IsOptional()
  isAIAvailable?: boolean

  @IsString()
  @IsOptional()
  type?: string

  @IsString()
  @IsOptional()
  tier?: string

  @IsString()
  @IsOptional()
  group?: string

  @IsOptional()
  aliases?: Record<string, string>
}
