import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RegenerateDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @IsString()
  @IsNotEmpty()
  userId!: string
}
