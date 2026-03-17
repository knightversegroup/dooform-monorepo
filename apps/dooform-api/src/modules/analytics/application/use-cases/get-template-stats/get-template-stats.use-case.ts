import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type {
  IStatisticsRepository,
  TemplateStatistics,
} from '../../../domain/repositories/statistics.repository'

interface GetTemplateStatsDto {
  templateId?: string
}

@Injectable()
@UseClassLogger('analytics')
export class GetTemplateStatsUseCase
  implements UseCase<GetTemplateStatsDto, TemplateStatistics[] | TemplateStatistics | null>
{
  constructor(
    @Inject('IStatisticsRepository')
    private readonly statisticsRepository: IStatisticsRepository,
  ) {}

  @UseResult()
  async execute(
    dto: GetTemplateStatsDto,
  ): Promise<Result<TemplateStatistics[] | TemplateStatistics | null>> {
    if (dto.templateId) {
      return (await this.statisticsRepository.getStatsByTemplate(
        dto.templateId,
      )) as any
    }

    return (await this.statisticsRepository.getTemplateStats()) as any
  }
}
