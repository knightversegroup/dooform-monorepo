import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import { GetDocumentDto } from '../../dtos/get-document.dto'

interface GetWatermarkPresetResult {
  id: string
  name: string
  config: any
  logoPath: string | null | undefined
  createdAt: Date
  updatedAt: Date
}

@Injectable()
@UseClassLogger('document')
export class GetWatermarkPresetUseCase implements UseCase<GetDocumentDto, GetWatermarkPresetResult> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
  ) {}

  @UseResult()
  async execute(dto: GetDocumentDto): Promise<Result<GetWatermarkPresetResult>> {
    const preset = await this.presetRepository.findById(dto.id)
    if (!preset) {
      throw new EntityNotFoundException(`Watermark preset with id ${dto.id} not found`)
    }
    if (!preset.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this preset')
    }

    const props = preset.getProps()

    return {
      id: preset.id,
      name: props.name,
      config: props.config,
      logoPath: props.logoPath,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
