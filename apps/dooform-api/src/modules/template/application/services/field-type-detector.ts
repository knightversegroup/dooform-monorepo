/**
 * Port of Go DetectFieldType and GenerateFieldDefinitions.
 * Auto-detects field types from placeholder names.
 */

export type DataType =
  | 'text'
  | 'id_number'
  | 'date'
  | 'time'
  | 'number'
  | 'address'
  | 'province'
  | 'district'
  | 'subdistrict'
  | 'country'
  | 'name_prefix'
  | 'name'
  | 'weekday'
  | 'phone'
  | 'email'
  | 'house_code'
  | 'zodiac'
  | 'lunar_month'
  | 'officer_name'

export type FieldEntity =
  | 'child'
  | 'mother'
  | 'father'
  | 'informant'
  | 'registrar'
  | 'general'

export type InputType =
  | 'text'
  | 'select'
  | 'date'
  | 'time'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'merged'
  | 'radio'

export interface FieldValidation {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  options?: string[]
  required?: boolean
}

export interface RadioOption {
  placeholder: string
  label: string
  value: string
  childFields?: string[]
}

export interface FieldDefinition {
  placeholder: string
  dataType: DataType
  entity: FieldEntity
  inputType: InputType
  validation?: FieldValidation
  label?: string
  description?: string
  group?: string
  groupOrder?: number
  order: number
  defaultValue?: string
  isMerged?: boolean
  mergedFields?: string[]
  separator?: string
  mergePattern?: string
  isRadioGroup?: boolean
  radioGroupId?: string
  radioOptions?: RadioOption[]
}

const DOLLAR_PATTERN = /^\$(\d+)$/
const N_PATTERN = /^n(\d+)$/

/**
 * Auto-detect field type from placeholder name.
 * Matches Go DetectFieldType logic exactly.
 */
export function detectFieldType(placeholder: string, order: number): FieldDefinition {
  const key = placeholder.replace(/\{\{/g, '').replace(/\}\}/g, '')
  const lowerKey = key.toLowerCase()

  const definition: FieldDefinition = {
    placeholder,
    dataType: 'text',
    entity: 'general',
    inputType: 'text',
    order,
  }

  // ID Number patterns
  if (lowerKey.includes('_id') || lowerKey === 'id_number' || lowerKey === 'id') {
    definition.dataType = 'id_number'
    definition.inputType = 'text'
    definition.validation = {
      pattern: '^\\d{13}$',
      maxLength: 13,
      minLength: 13,
    }
    return definition
  }

  // Name prefix patterns
  if (lowerKey.includes('name_prefix') || lowerKey.includes('_prefix')) {
    definition.dataType = 'name_prefix'
    definition.inputType = 'select'
    return definition
  }

  // Age patterns
  if (lowerKey.includes('_age') || lowerKey === 'age') {
    definition.dataType = 'number'
    definition.inputType = 'number'
    definition.validation = { min: 0, max: 150 }
    return definition
  }

  // Date patterns
  if (lowerKey === 'dob' || lowerKey.includes('date') || lowerKey.includes('_date')) {
    definition.dataType = 'date'
    definition.inputType = 'date'
    return definition
  }

  // Time patterns
  if (lowerKey === 'time' || lowerKey.includes('_time')) {
    definition.dataType = 'time'
    definition.inputType = 'time'
    return definition
  }

  // Province patterns
  if (lowerKey.includes('_prov') || lowerKey.includes('province')) {
    definition.dataType = 'province'
    definition.inputType = 'select'
    return definition
  }

  // Subdistrict patterns (must come before district)
  if (lowerKey.includes('subdistrict') || lowerKey.includes('sub_district') || lowerKey.includes('tambon')) {
    definition.dataType = 'subdistrict'
    definition.inputType = 'text'
    return definition
  }

  // District patterns
  if (lowerKey.includes('district') || lowerKey.includes('amphoe')) {
    definition.dataType = 'district'
    definition.inputType = 'text'
    return definition
  }

  // Country patterns
  if (lowerKey.includes('_country') || lowerKey.includes('country')) {
    definition.dataType = 'country'
    definition.inputType = 'text'
    return definition
  }

  // Address patterns
  if (lowerKey.includes('_address') || lowerKey.includes('address')) {
    definition.dataType = 'address'
    definition.inputType = 'textarea'
    return definition
  }

  // Name patterns
  if (lowerKey.includes('first_name') || lowerKey.includes('last_name') || lowerKey.includes('_name')) {
    definition.dataType = 'name'
    definition.inputType = 'text'
    return definition
  }

  // Number patterns ($1, $2, n1, n2, etc.)
  const dollarMatch = DOLLAR_PATTERN.exec(key)
  if (dollarMatch) {
    definition.dataType = 'number'
    definition.inputType = 'text'
    definition.group = 'dollar_numbers'
    definition.groupOrder = parseInt(dollarMatch[1], 10)
    return definition
  }

  const nMatch = N_PATTERN.exec(key)
  if (nMatch) {
    definition.dataType = 'number'
    definition.inputType = 'text'
    definition.group = 'n_numbers'
    definition.groupOrder = parseInt(nMatch[1], 10)
    return definition
  }

  return definition
}

/**
 * Generate field definitions for all placeholders.
 * Matches Go GenerateFieldDefinitions logic.
 */
export function generateFieldDefinitions(
  placeholders: string[],
): Record<string, FieldDefinition> {
  const definitions: Record<string, FieldDefinition> = {}

  for (let i = 0; i < placeholders.length; i++) {
    const placeholder = placeholders[i]
    const key = placeholder.replace(/\{\{/g, '').replace(/\}\}/g, '')
    definitions[key] = detectFieldType(placeholder, i)
  }

  return definitions
}
