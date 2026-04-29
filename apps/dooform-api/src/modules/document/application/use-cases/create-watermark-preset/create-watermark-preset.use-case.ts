import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { WatermarkPreset } from '../../../domain/entities/watermark-preset.entity'
import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import { CreateWatermarkPresetDto } from '../../dtos/create-watermark-preset.dto'

interface CreateWatermarkPresetResult {
  id: string
  name: string
  config: any
  createdAt: Date
}

@Injectable()
@UseClassLogger('document')
export class CreateWatermarkPresetUseCase implements UseCase<CreateWatermarkPresetDto, CreateWatermarkPresetResult> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
  ) {}

  @UseResult()
  @ValidateInput(CreateWatermarkPresetDto)
  async execute(dto: CreateWatermarkPresetDto): Promise<Result<CreateWatermarkPresetResult>> {
    const preset = WatermarkPreset.create({
      userId: dto.userId,
      name: dto.name,
      config: dto.config,
    })

    const saved = await this.presetRepository.save(preset)
    const props = saved.getProps()

    return {
      id: saved.id,
      name: props.name,
      config: props.config,
      createdAt: props.createdAt!,
    } as any
  }
}
