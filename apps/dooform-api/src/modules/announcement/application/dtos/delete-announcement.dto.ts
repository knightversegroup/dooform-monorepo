import { IsNotEmpty, IsUUID } from 'class-validator'

export class DeleteAnnouncementDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string
}
