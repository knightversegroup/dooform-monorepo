import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetStatsUseCase } from './get-stats.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetStatsUseCase],
  exports: [GetStatsUseCase],
})
export class GetStatsUseCaseModule {}
