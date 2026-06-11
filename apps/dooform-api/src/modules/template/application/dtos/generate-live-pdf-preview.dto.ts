import { Allow, IsNotEmpty, IsObject, IsUUID } from 'class-validator'

export class GenerateLivePdfPreviewDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string

  @IsObject()
  values!: Record<string, string>

  // Injected from request context
  @Allow()
  callerOrganizationId?: string | null
}
