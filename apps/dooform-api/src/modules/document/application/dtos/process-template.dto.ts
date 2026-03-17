import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator'

export class ProcessTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  templateId!: string

  @IsObject()
  @IsNotEmpty()
  data!: Record<string, string>

  @IsString()
  @IsOptional()
  userId?: string
}
