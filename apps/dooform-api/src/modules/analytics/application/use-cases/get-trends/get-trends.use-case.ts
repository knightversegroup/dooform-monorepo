import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type {
  IStatisticsRepository,
  TimeSeriesData,
} from '../../../domain/repositories/statistics.repository'
import { GetTrendsDto, GetTimeSeriesDto } from '../../dtos/get-trends.dto'

@Injectable()
@UseClassLogger('analytics')
export class GetTrendsUseCase
  implements UseCase<GetTrendsDto, Record<string, TimeSeriesData>>
{
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  async execute(
    dto: GetTrendsDto,
  ): Promise<Result<Record<string, TimeSeriesData>>> {
    const days = dto.days ?? 30
    return (await this.statisticsRepository.getTrends(
      days,
      dto.templateId,
    )) as any
  }
}

@Injectable()
@UseClassLogger('analytics')
export class GetTimeSeriesUseCase
  implements UseCase<GetTimeSeriesDto, TimeSeriesData>
{
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  async execute(dto: GetTimeSeriesDto): Promise<Result<TimeSeriesData>> {
    const days = dto.days ?? 30
    return (await this.statisticsRepository.getTimeSeries(
      dto.eventType,
      days,
      dto.templateId,
    )) as any
  }
}
