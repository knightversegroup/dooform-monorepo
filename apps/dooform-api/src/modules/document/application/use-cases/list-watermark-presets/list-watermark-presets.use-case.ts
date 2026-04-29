import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'

interface WatermarkPresetListItem {
  id: string
  name: string
  config: any
  logoPath: string | null | undefined
  createdAt: Date
}

@Injectable()
@UseClassLogger('document')
export class ListWatermarkPresetsUseCase implements UseCase<{ userId: string }, WatermarkPresetListItem[]> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
  ) {}

  @UseResult()
  async execute(dto: { userId: string }): Promise<Result<WatermarkPresetListItem[]>> {
    const presets = await this.presetRepository.findByUserId(dto.userId)

    return presets.map((preset) => {
      const props = preset.getProps()
      return {
        id: preset.id,
        name: props.name,
        config: props.config,
        logoPath: props.logoPath,
        createdAt: props.createdAt!,
      }
    }) as any
  }
}
