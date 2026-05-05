import { Allow, IsBoolean, IsNotEmpty, IsUUID } from 'class-validator'

export class PublishCollectionDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @IsBoolean()
  publish!: boolean

  @Allow()
  callerRole?: string
  @Allow()
  callerOrganizationId?: string | null
  @Allow()
  callerUserId?: string
}
