import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type {
  IActivityLogRepository,
  LogStats,
} from '../../../domain/repositories/activity-log.repository'

@Injectable()
@UseClassLogger('analytics')
export class GetLogStatsUseCase implements UseCase<Record<string, never>, LogStats> {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<LogStats>> {
    return (await this.activityLogRepository.getLogStats()) as any
  }
}
