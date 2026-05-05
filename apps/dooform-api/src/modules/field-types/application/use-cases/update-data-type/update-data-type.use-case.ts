import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import {
  INPUT_TYPE_VALUES,
  InputType,
} from '../../../domain/enums/input-type.enum'
import type { IDataTypeRepository } from '../../../domain/repositories/data-type.repository'

export interface UpdateDataTypeDto {
  id: string
  label?: string
  defaultInputType?: InputType
  description?: string | null
  options?: Array<{ label: string; value: string }> | null
  defaultValue?: string | null
  suggestedValues?: string[] | null
  sortOrder?: number
}

interface UpdateDataTypeResult {
  id: string
}

@Injectable()
@UseClassLogger('field-types')
export class UpdateDataTypeUseCase
  implements UseCase<UpdateDataTypeDto, UpdateDataTypeResult>
{
  constructor(
    @Inject('IDataTypeRepository')
    private readonly repo: IDataTypeRepository,
  ) {}

  @UseResult()
  async execute(dto: UpdateDataTypeDto): Promise<Result<UpdateDataTypeResult>> {
    const entity = await this.repo.findById(dto.id)
    if (!entity) throw new NotFoundException('Data type not found')

    if (dto.label !== undefined) {
      if (!dto.label.trim()) throw new BadRequestException('label cannot be empty')
      entity.rename(dto.label.trim())
    }
    if (dto.defaultInputType !== undefined) {
      if (!INPUT_TYPE_VALUES.includes(dto.defaultInputType)) {
        throw new BadRequestException(
          `defaultInputType must be one of: ${INPUT_TYPE_VALUES.join(', ')}`,
        )
      }
      entity.setDefaultInputType(dto.defaultInputType)
    }
    if (dto.description !== undefined) entity.setDescription(dto.description ?? null)
    if (dto.options !== undefined) entity.setOptions(dto.options ?? null)
    if (dto.defaultValue !== undefined) entity.setDefaultValue(dto.defaultValue ?? null)
    if (dto.suggestedValues !== undefined)
      entity.setSuggestedValues(dto.suggestedValues ?? null)
    if (dto.sortOrder !== undefined) entity.setSortOrder(dto.sortOrder)

    const saved = await this.repo.save(entity)
    return { id: saved.id } as any
  }
}
