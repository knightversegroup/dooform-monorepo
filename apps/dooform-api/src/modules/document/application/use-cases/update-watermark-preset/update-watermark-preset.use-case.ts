import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import { UpdateWatermarkPresetDto } from '../../dtos/update-watermark-preset.dto'

interface UpdateWatermarkPresetResult {
  id: string
  name: string
  config: any
  updatedAt: Date
}

@Injectable()
@UseClassLogger('document')
export class UpdateWatermarkPresetUseCase implements UseCase<UpdateWatermarkPresetDto, UpdateWatermarkPresetResult> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateWatermarkPresetDto)
  async execute(dto: UpdateWatermarkPresetDto): Promise<Result<UpdateWatermarkPresetResult>> {
    const preset = await this.presetRepository.findById(dto.id)
    if (!preset) {
      throw new EntityNotFoundException(`Watermark preset with id ${dto.id} not found`)
    }
    if (!preset.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this preset')
    }

    if (dto.name) {
      preset.updateName(dto.name)
    }
    if (dto.config) {
      preset.updateConfig(dto.config)
    }

    const saved = await this.presetRepository.save(preset)
    const props = saved.getProps()

    return {
      id: saved.id,
      name: props.name,
      config: props.config,
      updatedAt: props.updatedAt!,
    } as any
  }
}
