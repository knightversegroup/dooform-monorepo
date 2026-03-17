import { Module } from '@nestjs/common'

import { AnalyticsRepositoriesModule } from '../../../infrastructure/persistence/typeorm/analytics-repositories.module'

import { IngestEventUseCase } from './ingest-event.use-case'

@Module({
  imports: [AnalyticsRepositoriesModule],
  providers: [IngestEventUseCase],
  exports: [IngestEventUseCase],
})
export class IngestEventUseCaseModule {}
