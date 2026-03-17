import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { GetProcessLogsUseCase } from './get-process-logs.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [GetProcessLogsUseCase],
  exports: [GetProcessLogsUseCase],
})
export class GetProcessLogsUseCaseModule {}
