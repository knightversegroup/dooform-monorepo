import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IStatisticsRepository } from '../../../domain/repositories/statistics.repository'
import { RecordEventDto } from '../../dtos/record-event.dto'

interface IngestEventResult {
  success: boolean
}

@Injectable()
@UseClassLogger('analytics')
export class IngestEventUseCase implements UseCase<RecordEventDto, IngestEventResult> {
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  @ValidateInput(RecordEventDto)
  async execute(dto: RecordEventDto): Promise<Result<IngestEventResult>> {
    await this.statisticsRepository.incrementStat(
      dto.eventType,
      dto.templateId ?? null,
    )

    return { success: true } as any
  }
}
