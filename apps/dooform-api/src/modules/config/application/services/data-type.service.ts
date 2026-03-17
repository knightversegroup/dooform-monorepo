import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { DataTypeModel } from '../../infrastructure/persistence/typeorm/models/data-type.model'
import { DEFAULT_DATA_TYPES } from '../../domain/constants/default-data-types'
import type { CreateDataTypeDto, UpdateDataTypeDto } from '../dtos/data-type.dto'

@Injectable()
export class DataTypeService {
  private readonly logger = new Logger(DataTypeService.name)

  constructor(
    @InjectRepository(DataTypeModel)
    private readonly repository: Repository<DataTypeModel>,
  ) {}

  async getAll(activeOnly = false): Promise<DataTypeModel[]> {
    const query = this.repository.createQueryBuilder('dt').orderBy('dt.priority', 'DESC')
    if (activeOnly) {
      query.where('dt.is_active = :active', { active: true })
    }
    return query.getMany()
  }

  async getById(id: string): Promise<DataTypeModel> {
    const dataType = await this.repository.findOne({ where: { id } })
    if (!dataType) {
      throw new NotFoundException(`Data type with id '${id}' not found`)
    }
    return dataType
  }

  async getByCode(code: string): Promise<DataTypeModel> {
    const dataType = await this.repository.findOne({ where: { code } })
    if (!dataType) {
      throw new NotFoundException(`Data type with code '${code}' not found`)
    }
    return dataType
  }

  async create(dto: CreateDataTypeDto): Promise<DataTypeModel> {
    const dataType = this.repository.create({
      id: `dt_${uuidv4().substring(0, 8)}`,
      code: dto.code,
      name: dto.name,
      description: dto.description ?? '',
      pattern: dto.pattern ?? '',
      inputType: dto.inputType ?? 'text',
      validation: dto.validation ?? '{}',
      options: dto.options ?? '[]',
      defaultValue: dto.defaultValue ?? '',
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
    })
    return this.repository.save(dataType)
  }

  async update(id: string, dto: UpdateDataTypeDto): Promise<DataTypeModel> {
    const dataType = await this.getById(id)
    const updates: Partial<DataTypeModel> = {}
    if (dto.code !== undefined) updates.code = dto.code
    if (dto.name !== undefined) updates.name = dto.name
    if (dto.description !== undefined) updates.description = dto.description
    if (dto.pattern !== undefined) updates.pattern = dto.pattern
    if (dto.inputType !== undefined) updates.inputType = dto.inputType
    if (dto.validation !== undefined) updates.validation = dto.validation
    if (dto.options !== undefined) updates.options = dto.options
    if (dto.defaultValue !== undefined) updates.defaultValue = dto.defaultValue
    if (dto.priority !== undefined) updates.priority = dto.priority
    if (dto.isActive !== undefined) updates.isActive = dto.isActive
    Object.assign(dataType, updates)
    return this.repository.save(dataType)
  }

  async delete(id: string): Promise<void> {
    await this.getById(id)
    await this.repository.softDelete(id)
  }

  async initialize(): Promise<{ created: number; updated: number }> {
    let created = 0
    let updated = 0

    for (const defaults of DEFAULT_DATA_TYPES) {
      const existing = await this.repository.findOne({ where: { id: defaults.id } })
      if (!existing) {
        await this.repository.save(this.repository.create(defaults))
        created++
      } else {
        await this.repository.update(existing.id, defaults)
        updated++
      }
    }

    this.logger.log(`Initialized default data types: ${created} created, ${updated} updated`)
    return { created, updated }
  }
}
