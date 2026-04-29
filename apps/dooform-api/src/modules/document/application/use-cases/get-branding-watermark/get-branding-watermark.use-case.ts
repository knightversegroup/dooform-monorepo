import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import type { ISystemConfigRepository } from '../../../domain/repositories/system-config.repository'

const BRANDING_WATERMARK_KEY = 'branding_watermark'

const DEFAULT_BRANDING_CONFIG: WatermarkConfig = {
  lines: [{ text: 'สร้างโดย Dooform', bold: false, size: 24 }],
  fontColor: '#888888',
  opacity: 0.08,
  rotation: -45,
  position: 'center',
  scope: 'all',
}

interface GetBrandingWatermarkResult {
  config: WatermarkConfig
  updatedBy: string | null | undefined
  isDefault: boolean
}

@Injectable()
@UseClassLogger('document')
export class GetBrandingWatermarkUseCase implements UseCase<Record<string, never>, GetBrandingWatermarkResult> {
  constructor(
    @Inject('ISystemConfigRepository')
    private readonly systemConfigRepository: ISystemConfigRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<GetBrandingWatermarkResult>> {
    const config = await this.systemConfigRepository.findByKey(BRANDING_WATERMARK_KEY)

    if (!config) {
      return {
        config: DEFAULT_BRANDING_CONFIG,
        updatedBy: null,
        isDefault: true,
      } as any
    }

    return {
      config: config.value as WatermarkConfig,
      updatedBy: config.updatedBy,
      isDefault: false,
    } as any
  }
}
