import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { RecordEventUseCase } from './record-event.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [RecordEventUseCase],
  exports: [RecordEventUseCase],
})
export class RecordEventUseCaseModule {}
