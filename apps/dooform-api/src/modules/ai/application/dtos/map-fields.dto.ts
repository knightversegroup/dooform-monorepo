import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class MapFieldsDto {
  @IsString()
  @IsNotEmpty()
  image!: string

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  placeholders!: string[]
}
