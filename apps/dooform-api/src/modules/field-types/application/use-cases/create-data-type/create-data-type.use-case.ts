import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { DataType } from '../../../domain/entities/data-type.entity'
import {
  INPUT_TYPE_VALUES,
  InputType,
} from '../../../domain/enums/input-type.enum'
import type { IDataTypeRepository } from '../../../domain/repositories/data-type.repository'

export interface CreateDataTypeDto {
  code: string
  label: string
  defaultInputType: InputType
  description?: string | null
  options?: Array<{ label: string; value: string }> | null
  defaultValue?: string | null
  suggestedValues?: string[] | null
  sortOrder?: number
}

interface CreateDataTypeResult {
  id: string
  code: string
}

@Injectable()
@UseClassLogger('field-types')
export class CreateDataTypeUseCase
  implements UseCase<CreateDataTypeDto, CreateDataTypeResult>
{
  constructor(
    @Inject('IDataTypeRepository')
    private readonly repo: IDataTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: CreateDataTypeDto): Promise<Result<CreateDataTypeResult>> {
    const code = dto.code?.trim().toLowerCase()
    if (!code || !/^[a-z0-9_-]+$/.test(code)) {
      throw new BadRequestException(
        'code must be lowercase letters, digits, underscore or dash',
      )
    }
    if (!dto.label?.trim()) {
      throw new BadRequestException('label is required')
    }
    if (!INPUT_TYPE_VALUES.includes(dto.defaultInputType)) {
      throw new BadRequestException(
        `defaultInputType must be one of: ${INPUT_TYPE_VALUES.join(', ')}`,
      )
    }
    const existing = await this.repo.findByCode(code)
    if (existing) {
      throw new ConflictException(`A data type with code "${code}" already exists`)
    }
    const entity = DataType.create({
      code,
      label: dto.label.trim(),
      defaultInputType: dto.defaultInputType,
      description: dto.description ?? null,
      options: dto.options ?? null,
      defaultValue: dto.defaultValue ?? null,
      suggestedValues: dto.suggestedValues ?? null,
      sortOrder: dto.sortOrder ?? 999,
      isBuiltIn: false,
    })
    const saved = await this.repo.save(entity)
    return { id: saved.id, code: saved.code } as any
  }
}
