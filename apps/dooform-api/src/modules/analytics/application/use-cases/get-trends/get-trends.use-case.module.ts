import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetTrendsUseCase, GetTimeSeriesUseCase } from './get-trends.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetTrendsUseCase, GetTimeSeriesUseCase],
  exports: [GetTrendsUseCase, GetTimeSeriesUseCase],
})
export class GetTrendsUseCaseModule {}
