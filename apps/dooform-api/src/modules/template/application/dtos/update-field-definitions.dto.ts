import { IsNotEmpty, IsObject } from 'class-validator'

import type { FieldDefinition } from '../services/field-type-detector'

export class UpdateFieldDefinitionsDto {
  @IsObject()
  @IsNotEmpty()
  fieldDefinitions!: Record<string, FieldDefinition>
}
