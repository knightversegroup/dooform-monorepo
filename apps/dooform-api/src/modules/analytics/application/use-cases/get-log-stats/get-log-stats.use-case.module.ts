import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetLogStatsUseCase } from './get-log-stats.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetLogStatsUseCase],
  exports: [GetLogStatsUseCase],
})
export class GetLogStatsUseCaseModule {}
