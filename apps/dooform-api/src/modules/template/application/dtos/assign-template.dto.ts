import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class AssignTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateId!: string

  @IsString()
  @IsOptional()
  variantName?: string

  @IsInt()
  @IsOptional()
  variantOrder?: number
}

export class TemplateAssignmentItem {
  @IsString()
  @IsNotEmpty()
  templateId!: string

  @IsString()
  @IsOptional()
  variantName?: string

  @IsInt()
  @IsOptional()
  variantOrder?: number
}

export class BulkAssignTemplatesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateAssignmentItem)
  assignments!: TemplateAssignmentItem[]
}
