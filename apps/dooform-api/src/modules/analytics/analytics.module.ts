import { Module } from '@nestjs/common'

import { ACTIVITY_LOG_SERVICE } from '../../common/interceptors/activity-logging.interceptor'
import { AnalyticsRepositoriesModule } from './infrastructure/persistence/typeorm/analytics-repositories.module'
import { ActivityLoggingService } from './application/services/activity-logging.service'
import { AnalyticsInterfaceModule } from './interface/analytics.interface.module'

@Module({
  imports: [AnalyticsRepositoriesModule, AnalyticsInterfaceModule],
  providers: [
    ActivityLoggingService,
    {
      provide: ACTIVITY_LOG_SERVICE,
      useExisting: ActivityLoggingService,
    },
  ],
  exports: [ActivityLoggingService, ACTIVITY_LOG_SERVICE],
})
export class AnalyticsModule {}
