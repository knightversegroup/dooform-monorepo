import { Injectable, Logger } from '@nestjs/common'

import type { FieldDefinition, FieldValidation } from '../../domain/entities/field-definition.interface'
import type { IFieldDefinitionGeneratorService } from '../../domain/services/field-definition-generator.service'

interface DetectionResult {
  dataType: string
  inputType: string
  validation?: FieldValidation
}

const ENTITY_PREFIXES: Record<string, string> = {
  child: 'child',
  mother: 'mother',
  father: 'father',
  informant: 'informant',
  registrar: 'registrar',
  witness: 'witness',
  spouse: 'spouse',
  applicant: 'applicant',
}

@Injectable()
export class FieldDefinitionGeneratorService implements IFieldDefinitionGeneratorService {
  private readonly logger = new Logger(FieldDefinitionGeneratorService.name)

  generateFromPlaceholders(placeholders: string[]): FieldDefinition[] {
    const definitions: FieldDefinition[] = []

    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i]
      const detection = this.detectFieldType(placeholder)
      const entity = this.detectEntity(placeholder)
      const group = this.detectGroup(placeholder)

      definitions.push({
        placeholder,
        dataType: detection.dataType,
        inputType: detection.inputType,
        validation: detection.validation,
        entity,
        label: this.generateLabel(placeholder),
        description: '',
        group: group.name,
        groupOrder: group.order,
        order: i + 1,
        defaultValue: '',
        isMerged: false,
        mergedFields: [],
        separator: ' ',
        mergePattern: '',
        isRadioGroup: false,
        radioGroupId: '',
        radioOptions: [],
      })
    }

    this.logger.debug(`Generated ${definitions.length} field definitions from placeholders`)
    return definitions
  }

  private detectFieldType(placeholder: string): DetectionResult {
    const lower = placeholder.toLowerCase()

    // ID number (Thai 13-digit)
    if (lower.endsWith('_id') || lower === 'id_number' || lower === 'citizen_id') {
      return {
        dataType: 'id_number',
        inputType: 'text',
        validation: { pattern: '^\\d{13}$', min: 13, max: 13 },
      }
    }

    // Date fields
    if (lower.endsWith('_date') || lower === 'dob' || lower === 'date_of_birth' || lower === 'birth_date') {
      return {
        dataType: 'date',
        inputType: 'date',
        validation: {},
      }
    }

    // Time fields
    if (lower.endsWith('_time') || lower === 'time') {
      return {
        dataType: 'time',
        inputType: 'time',
        validation: {},
      }
    }

    // Age
    if (lower.endsWith('_age') || lower === 'age') {
      return {
        dataType: 'number',
        inputType: 'number',
        validation: { min: 0, max: 150 },
      }
    }

    // Phone/tel
    if (lower.endsWith('_phone') || lower.endsWith('_tel') || lower === 'phone' || lower === 'telephone') {
      return {
        dataType: 'phone',
        inputType: 'tel',
        validation: { pattern: '^0\\d{8,9}$' },
      }
    }

    // Email
    if (lower.endsWith('_email') || lower === 'email') {
      return {
        dataType: 'email',
        inputType: 'email',
        validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      }
    }

    // Province (select dropdown)
    if (lower.endsWith('_prov') || lower.endsWith('_province')) {
      return {
        dataType: 'text',
        inputType: 'select',
        validation: {},
      }
    }

    // District
    if (lower.endsWith('_dist') || lower.endsWith('_district') || lower.endsWith('_amphoe')) {
      return {
        dataType: 'text',
        inputType: 'select',
        validation: {},
      }
    }

    // Sub-district
    if (lower.endsWith('_subdist') || lower.endsWith('_subdistrict') || lower.endsWith('_tambon')) {
      return {
        dataType: 'text',
        inputType: 'select',
        validation: {},
      }
    }

    // Address (textarea)
    if (lower.endsWith('_address') || lower === 'address' || lower.endsWith('_addr')) {
      return {
        dataType: 'text',
        inputType: 'textarea',
        validation: {},
      }
    }

    // Number fields (digit groups)
    if (/^\$\d+$/.test(placeholder) || /^n\d+$/.test(lower) || /^d\d+$/.test(lower)) {
      return {
        dataType: 'number',
        inputType: 'number',
        validation: { min: 0, max: 9 },
      }
    }

    // Number suffix
    if (lower.endsWith('_number') || lower.endsWith('_num') || lower.endsWith('_amount') || lower.endsWith('_count')) {
      return {
        dataType: 'number',
        inputType: 'number',
        validation: {},
      }
    }

    // Default: text
    return {
      dataType: 'text',
      inputType: 'text',
      validation: {},
    }
  }

  private detectEntity(placeholder: string): string | undefined {
    const lower = placeholder.toLowerCase()

    for (const [prefix, entity] of Object.entries(ENTITY_PREFIXES)) {
      if (lower.startsWith(`${prefix}_`)) {
        return entity
      }
    }

    return 'general'
  }

  private detectGroup(placeholder: string): { name: string; order: number } {
    const lower = placeholder.toLowerCase()

    for (const [index, prefix] of Object.keys(ENTITY_PREFIXES).entries()) {
      if (lower.startsWith(`${prefix}_`)) {
        return { name: `${prefix}_info`, order: index + 1 }
      }
    }

    return { name: 'general', order: 0 }
  }

  private generateLabel(placeholder: string): string {
    // Remove entity prefix if present
    let label = placeholder
    for (const prefix of Object.keys(ENTITY_PREFIXES)) {
      if (label.toLowerCase().startsWith(`${prefix}_`)) {
        label = label.slice(prefix.length + 1)
        break
      }
    }

    // Convert snake_case to Title Case
    return label
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
}
