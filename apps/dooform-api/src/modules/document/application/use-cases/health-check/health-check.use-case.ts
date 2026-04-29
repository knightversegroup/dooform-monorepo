import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IPdfConverterService } from '../../../domain/services/pdf-converter.service'

interface HealthCheckResult {
  status: 'healthy' | 'degraded'
  services: {
    libreoffice: boolean
  }
}

@Injectable()
@UseClassLogger('document')
export class HealthCheckUseCase implements UseCase<Record<string, never>, HealthCheckResult> {
  constructor(
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<HealthCheckResult>> {
    const libreofficeAvailable = await this.pdfConverter.isAvailable()

    return {
      status: libreofficeAvailable ? 'healthy' : 'degraded',
      services: {
        libreoffice: libreofficeAvailable,
      },
    } as any
  }
}
