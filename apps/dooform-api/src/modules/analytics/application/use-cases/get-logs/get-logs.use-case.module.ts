import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetLogsUseCase } from './get-logs.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetLogsUseCase],
  exports: [GetLogsUseCase],
})
export class GetLogsUseCaseModule {}
