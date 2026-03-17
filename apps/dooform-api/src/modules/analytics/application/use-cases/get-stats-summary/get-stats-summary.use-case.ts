import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type {
  IStatisticsRepository,
  StatisticsSummary,
} from '../../../domain/repositories/statistics.repository'

@Injectable()
@UseClassLogger('analytics')
export class GetStatsSummaryUseCase implements UseCase<Record<string, never>, StatisticsSummary> {
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<StatisticsSummary>> {
    return (await this.statisticsRepository.getSummary()) as any
  }
}
