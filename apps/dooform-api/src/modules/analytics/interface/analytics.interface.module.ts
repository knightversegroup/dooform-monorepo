import { Module } from '@nestjs/common'

import { GetLogsUseCaseModule } from '../application/use-cases/get-logs/get-logs.use-case.module'
import { GetLogStatsUseCaseModule } from '../application/use-cases/get-log-stats/get-log-stats.use-case.module'
import { GetProcessLogsUseCaseModule } from '../application/use-cases/get-process-logs/get-process-logs.use-case.module'
import { GetHistoryUseCaseModule } from '../application/use-cases/get-history/get-history.use-case.module'
import { IngestEventUseCaseModule } from '../application/use-cases/ingest-event/ingest-event.use-case.module'
import { GetStatsUseCaseModule } from '../application/use-cases/get-stats/get-stats.use-case.module'
import { GetStatsSummaryUseCaseModule } from '../application/use-cases/get-stats-summary/get-stats-summary.use-case.module'
import { GetTemplateStatsUseCaseModule } from '../application/use-cases/get-template-stats/get-template-stats.use-case.module'
import { GetTrendsUseCaseModule } from '../application/use-cases/get-trends/get-trends.use-case.module'
import { RecordEventUseCaseModule } from '../application/use-cases/record-event/record-event.use-case.module'

import { AnalyticsController } from './rest/controllers/analytics.controller'

@Module({
  imports: [
    GetLogsUseCaseModule,
    GetLogStatsUseCaseModule,
    GetProcessLogsUseCaseModule,
    GetHistoryUseCaseModule,
    IngestEventUseCaseModule,
    GetStatsUseCaseModule,
    GetStatsSummaryUseCaseModule,
    GetTemplateStatsUseCaseModule,
    GetTrendsUseCaseModule,
    RecordEventUseCaseModule,
  ],
  controllers: [AnalyticsController],
})
export class AnalyticsInterfaceModule {}
