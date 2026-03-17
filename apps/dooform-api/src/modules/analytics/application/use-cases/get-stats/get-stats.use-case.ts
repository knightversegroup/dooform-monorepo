import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type {
  IStatisticsRepository,
  StatisticsSummary,
  TemplateStatistics,
  TimeSeriesData,
} from '../../../domain/repositories/statistics.repository'
import { GetTrendsDto } from '../../dtos/get-trends.dto'

interface GetStatsResult {
  summary: StatisticsSummary
  templates: TemplateStatistics[]
  trends: Record<string, TimeSeriesData>
}

@Injectable()
@UseClassLogger('analytics')
export class GetStatsUseCase implements UseCase<GetTrendsDto, GetStatsResult> {
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  async execute(dto: GetTrendsDto): Promise<Result<GetStatsResult>> {
    const days = dto.days ?? 30

    const [summary, templates, trends] = await Promise.all([
      this.statisticsRepository.getSummary(),
      this.statisticsRepository.getTemplateStats(),
      this.statisticsRepository.getTrends(days, dto.templateId),
    ])

    return {
      summary,
      templates,
      trends,
    } as any
  }
}
