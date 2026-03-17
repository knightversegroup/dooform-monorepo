import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetTemplateStatsUseCase } from './get-template-stats.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetTemplateStatsUseCase],
  exports: [GetTemplateStatsUseCase],
})
export class GetTemplateStatsUseCaseModule {}
