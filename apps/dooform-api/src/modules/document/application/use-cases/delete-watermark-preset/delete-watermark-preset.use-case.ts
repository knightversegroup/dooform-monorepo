import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import { DeleteDocumentDto } from '../../dtos/delete-document.dto'

interface DeleteWatermarkPresetResult {
  success: boolean
}

@Injectable()
@UseClassLogger('document')
export class DeleteWatermarkPresetUseCase implements UseCase<DeleteDocumentDto, DeleteWatermarkPresetResult> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
  ) {}

  @UseResult()
  async execute(dto: DeleteDocumentDto): Promise<Result<DeleteWatermarkPresetResult>> {
    const preset = await this.presetRepository.findById(dto.id)
    if (!preset) {
      throw new EntityNotFoundException(`Watermark preset with id ${dto.id} not found`)
    }
    if (!preset.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this preset')
    }

    await this.presetRepository.deleteById(dto.id)

    return { success: true } as any
  }
}
