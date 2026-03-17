import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  displayName!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  author?: string
}
