import { IsNotEmpty, IsUUID } from 'class-validator'

export class GetDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string
}
