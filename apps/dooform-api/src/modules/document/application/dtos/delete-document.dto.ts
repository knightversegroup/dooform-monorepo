import { IsNotEmpty, IsUUID } from 'class-validator'

export class DeleteDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string
}
