import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { FieldRuleModel } from '../../infrastructure/persistence/typeorm/models/field-rule.model'
import { DEFAULT_FIELD_RULES } from '../../domain/constants/default-field-rules'
import type { CreateFieldRuleDto, UpdateFieldRuleDto } from '../dtos/field-rule.dto'

interface FieldDefinitionOption {
  value: string
  label: string
}

export interface FieldDefinition {
  key: string
  label: string
  inputType: string
  dataType: string
  entity: string
  required: boolean
  validation?: Record<string, unknown>
  options?: FieldDefinitionOption[]
}

@Injectable()
export class FieldRuleService {
  private readonly logger = new Logger(FieldRuleService.name)

  constructor(
    @InjectRepository(FieldRuleModel)
    private readonly repository: Repository<FieldRuleModel>,
  ) {}

  async getAll(): Promise<FieldRuleModel[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    })
  }

  async getAllIncludingInactive(): Promise<FieldRuleModel[]> {
    return this.repository.find({ order: { priority: 'DESC' } })
  }

  async getById(id: string): Promise<FieldRuleModel> {
    const rule = await this.repository.findOne({ where: { id } })
    if (!rule) {
      throw new NotFoundException(`Field rule with id '${id}' not found`)
    }
    return rule
  }

  async create(dto: CreateFieldRuleDto): Promise<FieldRuleModel> {
    this.validateRegexPattern(dto.pattern)
    const rule = this.repository.create({
      id: `fr_${uuidv4().substring(0, 8)}`,
      name: dto.name,
      code: dto.code,
      description: dto.description ?? '',
      pattern: dto.pattern,
      inputType: dto.inputType ?? 'text',
      validation: dto.validation ?? '{}',
      options: dto.options ?? '[]',
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.repository.save(rule)
  }

  async update(id: string, dto: UpdateFieldRuleDto): Promise<FieldRuleModel> {
    const rule = await this.getById(id)
    if (dto.pattern !== undefined) {
      this.validateRegexPattern(dto.pattern)
      rule.pattern = dto.pattern
    }
    if (dto.name !== undefined) rule.name = dto.name
    if (dto.code !== undefined) rule.code = dto.code
    if (dto.description !== undefined) rule.description = dto.description
    if (dto.inputType !== undefined) rule.inputType = dto.inputType
    if (dto.validation !== undefined) rule.validation = dto.validation
    if (dto.options !== undefined) rule.options = dto.options
    if (dto.priority !== undefined) rule.priority = dto.priority
    if (dto.isActive !== undefined) rule.isActive = dto.isActive
    return this.repository.save(rule)
  }

  async delete(id: string): Promise<void> {
    await this.getById(id)
    await this.repository.softDelete(id)
  }

  async initialize(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    for (const defaults of DEFAULT_FIELD_RULES) {
      const existing = await this.repository.findOne({ where: { id: defaults.id } })
      if (!existing) {
        await this.repository.save(this.repository.create(defaults))
        created++
      } else {
        await this.repository.update(existing.id, defaults)
        updated++
      }
    }

    this.logger.log(`Initialized default field rules: ${created} created, ${updated} updated`)
    return { created, updated }
  }

  testRule(pattern: string, testString: string): { matches: boolean; pattern: string; testString: string } {
    this.validateRegexPattern(pattern)
    const re = new RegExp(pattern, 'i')
    return {
      matches: re.test(testString),
      pattern,
      testString,
    }
  }

  async generateFieldDefinitions(placeholders: string[]): Promise<Record<string, FieldDefinition>> {
    const rules = await this.getAll()
    const result: Record<string, FieldDefinition> = {}

    for (const placeholder of placeholders) {
      result[placeholder] = this.applyRulesToPlaceholder(placeholder, rules)
    }

    return result
  }

  private applyRulesToPlaceholder(placeholder: string, rules: FieldRuleModel[]): FieldDefinition {
    const result: FieldDefinition = {
      key: placeholder,
      label: this.generateLabel(placeholder),
      inputType: 'text',
      dataType: 'text',
      entity: 'general',
      required: false,
    }

    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

    for (const rule of sortedRules) {
      if (!rule.isActive) continue

      try {
        const re = new RegExp(rule.pattern, 'i')
        if (re.test(placeholder)) {
          result.inputType = rule.inputType
          result.dataType = rule.code

          if (rule.validation && rule.validation !== '{}') {
            try {
              const validation = JSON.parse(rule.validation) as Record<string, unknown>
              result.validation = validation
              if (typeof validation['required'] === 'boolean') {
                result.required = validation['required']
              }
            } catch { /* ignore parse errors */ }
          }

          if (rule.options && rule.options !== '[]') {
            try {
              result.options = JSON.parse(rule.options) as FieldDefinitionOption[]
            } catch { /* ignore parse errors */ }
          }

          break
        }
      } catch {
        continue
      }
    }

    return result
  }

  private generateLabel(key: string): string {
    const label = key.replace(/[_-]/g, ' ')
    return label
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  private validateRegexPattern(pattern: string): void {
    try {
      new RegExp(pattern, 'i')
    } catch {
      throw new BadRequestException(`Invalid regex pattern: ${pattern}`)
    }
  }
}
