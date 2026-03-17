import { IsNotEmpty, IsString } from 'class-validator'

export class UseQuotaDto {
  @IsString()
  @IsNotEmpty()
  document_id!: string
}
