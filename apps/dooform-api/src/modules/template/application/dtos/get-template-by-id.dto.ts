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

  // Optional thumbnail size — 'sm' returns the low-res variant for list previews,
  // any other value (or undefined) returns the HD default.
  @Allow()
  size?: 'sm' | 'hd'
}
