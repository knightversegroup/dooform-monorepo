import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { SystemConfig } from '../../../domain/entities/system-config.entity'
import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import type { ISystemConfigRepository } from '../../../domain/repositories/system-config.repository'
import { UpdateBrandingWatermarkDto } from '../../dtos/update-branding-watermark.dto'

const BRANDING_WATERMARK_KEY = 'branding_watermark'

interface UpdateBrandingWatermarkResult {
  config: WatermarkConfig
  updatedBy: string
}

@Injectable()
@UseClassLogger('document')
export class UpdateBrandingWatermarkUseCase implements UseCase<UpdateBrandingWatermarkDto, UpdateBrandingWatermarkResult> {
  constructor(
    @Inject('ISystemConfigRepository')
    private readonly systemConfigRepository: ISystemConfigRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateBrandingWatermarkDto)
  async execute(dto: UpdateBrandingWatermarkDto): Promise<Result<UpdateBrandingWatermarkResult>> {
    let config = await this.systemConfigRepository.findByKey(BRANDING_WATERMARK_KEY)

    if (config) {
      config.updateValue(dto.config, dto.userId)
    } else {
      config = SystemConfig.create({
        key: BRANDING_WATERMARK_KEY,
        value: dto.config,
        updatedBy: dto.userId,
      })
    }

    const saved = await this.systemConfigRepository.save(config)

    return {
      config: saved.value as WatermarkConfig,
      updatedBy: dto.userId,
    } as any
  }
}
