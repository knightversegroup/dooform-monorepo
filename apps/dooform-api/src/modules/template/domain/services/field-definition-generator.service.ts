import type { FieldDefinition } from '../entities/field-definition.interface'

export interface IFieldDefinitionGeneratorService {
  generateFromPlaceholders(placeholders: string[]): FieldDefinition[]
}
