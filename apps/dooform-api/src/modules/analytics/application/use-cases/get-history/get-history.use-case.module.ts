import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetHistoryUseCase } from './get-history.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetHistoryUseCase],
  exports: [GetHistoryUseCase],
})
export class GetHistoryUseCaseModule {}
