import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit' })
  password!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name!: string
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  password!: string
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token!: string
}

export class UpdateProfileDto {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  first_name?: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  last_name?: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  display_name?: string
}
