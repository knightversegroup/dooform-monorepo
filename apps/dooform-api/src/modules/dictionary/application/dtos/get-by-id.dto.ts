import { Allow, IsNotEmpty, IsUUID } from 'class-validator'

export class GetByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
