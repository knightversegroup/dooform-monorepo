import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { EntityRuleModel } from '../../infrastructure/persistence/typeorm/models/entity-rule.model'
import { DEFAULT_ENTITY_RULES } from '../../domain/constants/default-entity-rules'
import type { CreateEntityRuleDto, UpdateEntityRuleDto } from '../dtos/entity-rule.dto'

@Injectable()
export class EntityRuleService {
  private readonly logger = new Logger(EntityRuleService.name)

  constructor(
    @InjectRepository(EntityRuleModel)
    private readonly repository: Repository<EntityRuleModel>,
  ) {}

  async getAll(): Promise<EntityRuleModel[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    })
  }

  async getAllIncludingInactive(): Promise<EntityRuleModel[]> {
    return this.repository.find({ order: { priority: 'DESC' } })
  }

  async getById(id: string): Promise<EntityRuleModel> {
    const rule = await this.repository.findOne({ where: { id } })
    if (!rule) {
      throw new NotFoundException(`Entity rule with id '${id}' not found`)
    }
    return rule
  }

  async create(dto: CreateEntityRuleDto): Promise<EntityRuleModel> {
    this.validateRegexPattern(dto.pattern)
    const rule = this.repository.create({
      id: `entity_${uuidv4().substring(0, 8)}`,
      name: dto.name,
      code: dto.code,
      description: dto.description ?? '',
      pattern: dto.pattern,
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
      color: dto.color ?? '',
      icon: dto.icon ?? '',
    })
    return this.repository.save(rule)
  }

  async update(id: string, dto: UpdateEntityRuleDto): Promise<EntityRuleModel> {
    const rule = await this.getById(id)
    if (dto.pattern !== undefined) {
      this.validateRegexPattern(dto.pattern)
      rule.pattern = dto.pattern
    }
    if (dto.name !== undefined) rule.name = dto.name
    if (dto.code !== undefined) rule.code = dto.code
    if (dto.description !== undefined) rule.description = dto.description
    if (dto.priority !== undefined) rule.priority = dto.priority
    if (dto.isActive !== undefined) rule.isActive = dto.isActive
    if (dto.color !== undefined) rule.color = dto.color
    if (dto.icon !== undefined) rule.icon = dto.icon
    return this.repository.save(rule)
  }

  async delete(id: string): Promise<void> {
    await this.getById(id)
    await this.repository.softDelete(id)
  }

  async initialize(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    for (const defaults of DEFAULT_ENTITY_RULES) {
      const existing = await this.repository.findOne({ where: { id: defaults.id } })
      if (!existing) {
        await this.repository.save(this.repository.create(defaults))
        created++
      } else {
        await this.repository.update(existing.id, defaults)
        updated++
      }
    }

    this.logger.log(`Initialized default entity rules: ${created} created, ${updated} updated`)
    return { created, updated }
  }

  async detectEntity(key: string): Promise<string> {
    const rules = await this.getAll()
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

    for (const rule of sortedRules) {
      if (!rule.isActive) continue
      try {
        const re = new RegExp(rule.pattern, 'i')
        if (re.test(key)) {
          return rule.code
        }
      } catch {
        continue
      }
    }

    return 'general'
  }

  async getEntityLabels(): Promise<Record<string, string>> {
    const rules = await this.getAllIncludingInactive()
    const labels: Record<string, string> = {}
    for (const rule of rules) {
      labels[rule.code] = rule.name
    }
    return labels
  }

  async getEntityColors(): Promise<Record<string, string>> {
    const rules = await this.getAllIncludingInactive()
    const colors: Record<string, string> = {}
    for (const rule of rules) {
      colors[rule.code] = rule.color
    }
    return colors
  }

  private validateRegexPattern(pattern: string): void {
    try {
      new RegExp(pattern, 'i')
    } catch {
      throw new BadRequestException(`Invalid regex pattern: ${pattern}`)
    }
  }
}
