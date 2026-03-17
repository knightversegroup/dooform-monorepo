import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { InputTypeModel } from '../../infrastructure/persistence/typeorm/models/input-type.model'
import { DEFAULT_INPUT_TYPES } from '../../domain/constants/default-input-types'
import type { CreateInputTypeDto, UpdateInputTypeDto } from '../dtos/input-type.dto'

@Injectable()
export class InputTypeService {
  private readonly logger = new Logger(InputTypeService.name)

  constructor(
    @InjectRepository(InputTypeModel)
    private readonly repository: Repository<InputTypeModel>,
  ) {}

  async getAll(activeOnly = false): Promise<InputTypeModel[]> {
    const query = this.repository.createQueryBuilder('it').orderBy('it.priority', 'DESC')
    if (activeOnly) {
      query.where('it.is_active = :active', { active: true })
    }
    return query.getMany()
  }

  async getById(id: string): Promise<InputTypeModel> {
    const inputType = await this.repository.findOne({ where: { id } })
    if (!inputType) {
      throw new NotFoundException(`Input type with id '${id}' not found`)
    }
    return inputType
  }

  async create(dto: CreateInputTypeDto): Promise<InputTypeModel> {
    const inputType = this.repository.create({
      id: `it_${uuidv4().substring(0, 8)}`,
      code: dto.code,
      name: dto.name,
      description: dto.description ?? '',
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.repository.save(inputType)
  }

  async update(id: string, dto: UpdateInputTypeDto): Promise<InputTypeModel> {
    const inputType = await this.getById(id)
    const updates: Partial<InputTypeModel> = {}
    if (dto.code !== undefined) updates.code = dto.code
    if (dto.name !== undefined) updates.name = dto.name
    if (dto.description !== undefined) updates.description = dto.description
    if (dto.priority !== undefined) updates.priority = dto.priority
    if (dto.isActive !== undefined) updates.isActive = dto.isActive
    Object.assign(inputType, updates)
    return this.repository.save(inputType)
  }

  async delete(id: string): Promise<void> {
    await this.getById(id)
    await this.repository.softDelete(id)
  }

  async initialize(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    for (const defaults of DEFAULT_INPUT_TYPES) {
      const existing = await this.repository.findOne({ where: { id: defaults.id } })
      if (!existing) {
        await this.repository.save(this.repository.create(defaults))
        created++
      } else {
        await this.repository.update(existing.id, defaults)
        updated++
      }
    }

    this.logger.log(`Initialized default input types: ${created} created, ${updated} updated`)
    return { created, updated }
  }
}
