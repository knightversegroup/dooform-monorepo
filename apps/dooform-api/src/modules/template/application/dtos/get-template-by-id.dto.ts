import { Allow, IsNotEmpty, IsUUID } from 'class-validator'

export class GetTemplateByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  // Injected from request context — non-admins cannot fetch DRAFT/ARCHIVED templates.
  @Allow()
  callerRole?: string

  @Allow()
  callerOrganizationId?: string | null

  @Allow()
  callerUserId?: string
}
