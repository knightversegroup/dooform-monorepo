import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetStatsSummaryUseCase } from './get-stats-summary.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetStatsSummaryUseCase],
  exports: [GetStatsSummaryUseCase],
})
export class GetStatsSummaryUseCaseModule {}
