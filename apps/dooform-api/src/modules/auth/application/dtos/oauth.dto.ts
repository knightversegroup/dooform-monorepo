import { IsNotEmpty, IsString } from 'class-validator'

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  id_token!: string
}

export class LineLoginDto {
  @IsString()
  @IsNotEmpty()
  code!: string

  @IsString()
  @IsNotEmpty()
  redirect_uri!: string
}
