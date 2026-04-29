import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ISystemConfigRepository } from '../../../domain/repositories/system-config.repository'

const BRANDING_WATERMARK_KEY = 'branding_watermark'

interface DeleteBrandingWatermarkResult {
  success: boolean
  message: string
}

@Injectable()
@UseClassLogger('document')
export class DeleteBrandingWatermarkUseCase implements UseCase<Record<string, never>, DeleteBrandingWatermarkResult> {
  constructor(
    @Inject('ISystemConfigRepository')
    private readonly systemConfigRepository: ISystemConfigRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<DeleteBrandingWatermarkResult>> {
    await this.systemConfigRepository.deleteByKey(BRANDING_WATERMARK_KEY)

    return {
      success: true,
      message: 'Branding watermark reset to default',
    } as any
  }
}
