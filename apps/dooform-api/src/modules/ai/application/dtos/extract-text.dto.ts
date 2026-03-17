import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ExtractTextDto {
  @IsString()
  @IsNotEmpty()
  image!: string

  @IsString()
  @IsOptional()
  template_id?: string
}
