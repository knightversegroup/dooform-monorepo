import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'StrongPass!123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string

  @ApiPropertyOptional({
    description: 'Create a new organization with this name. Required if no inviteCode.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string

  @ApiPropertyOptional({ description: 'Join an existing organization via invite code.' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  inviteCode?: string
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string
}

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsEmail()
  email!: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}

export class CompleteOnboardingDto {
  @ApiProperty({ description: 'Confirmed/edited display name.' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string

  @ApiPropertyOptional({ description: 'Optional avatar URL (https).' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string

  @ApiPropertyOptional({ description: 'Organization name. Editable by ORG_ADMIN only.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string

  @ApiPropertyOptional({ description: 'Optional job title.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string

  @ApiPropertyOptional({ description: 'IANA timezone, e.g. Asia/Bangkok.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string

  @ApiPropertyOptional({ description: 'Locale, e.g. en-US, th-TH.' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string
}

export class UpdateOrganizationTierDto {
  @ApiProperty({ enum: ['free', 'pro', 'max'] })
  @IsString()
  tier!: 'free' | 'pro' | 'max'
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['USER', 'ORG_ADMIN'] })
  @IsString()
  role!: 'USER' | 'ORG_ADMIN'
}

export class CreateInviteCodeDto {
  @ApiPropertyOptional({ description: 'Days until the code expires. Defaults to 7.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number

  @ApiPropertyOptional({
    description: 'Organization id. Defaults to the caller\'s organization. GLOBAL_ADMIN may pass any.',
  })
  @IsOptional()
  @IsString()
  organizationId?: string
}
