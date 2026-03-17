import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SmartOcrDto {
  @IsString()
  @IsNotEmpty()
  image!: string

  @IsString()
  @IsOptional()
  template_id?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  placeholders?: string[]

  @IsString()
  @IsOptional()
  provider?: string
}
