import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IStatisticsRepository } from '../../../domain/repositories/statistics.repository'
import { RecordEventDto } from '../../dtos/record-event.dto'

interface RecordEventResult {
  success: boolean
  message: string
}

@Injectable()
@UseClassLogger('analytics')
export class RecordEventUseCase implements UseCase<RecordEventDto, RecordEventResult> {
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  @ValidateInput(RecordEventDto)
  async execute(dto: RecordEventDto): Promise<Result<RecordEventResult>> {
    // Increment template-specific stat
    await this.statisticsRepository.incrementStat(
      dto.eventType,
      dto.templateId ?? null,
    )

    // Also increment global stat (null template_id) if template-specific
    if (dto.templateId) {
      await this.statisticsRepository.incrementStat(dto.eventType, null)
    }

    return {
      success: true,
      message: 'Event recorded successfully',
    } as any
  }
}
