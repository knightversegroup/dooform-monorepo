import { IsNotEmpty, IsUUID } from 'class-validator'

export class GetTemplateByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string
}
