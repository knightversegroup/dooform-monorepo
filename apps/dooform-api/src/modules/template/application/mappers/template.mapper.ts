import type { Template } from '../../domain/entities/template.entity'
import type { DocumentType } from '../../domain/entities/document-type.entity'

export interface TemplateResponse {
  id: string
  name: string
  description: string | null
  author: string
  category: string | null
  type: string
  tier: string
  is_verified: boolean
  is_ai_available: boolean
  placeholders: string[]
  aliases: Record<string, string>
  field_definitions: Record<string, any>
  original_source: string
  remarks: string
  group: string
  file_size: number
  document_type_id: string
  variant_name: string
  variant_order: number
  document_type?: DocumentTypeResponse | null
  created_at: Date
  updated_at: Date
}

export interface DocumentTypeResponse {
  id: string
  name: string
  name_en: string
  code: string
  category: string
  description: string
  sort_order: number
  templates?: TemplateResponse[]
}

/**
 * Maps a Template domain entity to a response DTO.
 * Matches Go Template.ToResponse() logic.
 */
export function toTemplateResponse(template: Template): TemplateResponse {
  const props = template.getProps()

  return {
    id: template.id,
    name: template.getDisplayLabel(),
    description: props.description,
    author: props.author,
    category: props.category,
    type: props.type,
    tier: props.tier,
    is_verified: props.isVerified,
    is_ai_available: props.isAIAvailable,
    placeholders: template.getParsedPlaceholders(),
    aliases: template.getParsedAliases(),
    field_definitions: template.getParsedFieldDefinitions(),
    original_source: props.originalSource,
    remarks: props.remarks,
    group: props.group,
    file_size: props.fileSize,
    document_type_id: props.documentTypeId ?? '',
    variant_name: props.variantName,
    variant_order: props.variantOrder,
    created_at: props.createdAt!,
    updated_at: props.updatedAt!,
  }
}

/**
 * Maps a DocumentType domain entity to a response DTO.
 */
export function toDocumentTypeResponse(docType: DocumentType): DocumentTypeResponse {
  const props = docType.getProps()

  return {
    id: docType.id,
    name: props.name,
    name_en: props.nameEn,
    code: props.code,
    category: props.category,
    description: props.description,
    sort_order: props.sortOrder,
  }
}
