import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { ActivityLogModel } from './models/activity-log.model'
import { StatisticsModel } from './models/statistics.model'
import { TypeOrmActivityLogRepository } from './repositories/activity-log.repository'
import { TypeOrmStatisticsRepository } from './repositories/statistics.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLogModel, StatisticsModel]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'IActivityLogRepository',
      useClass: TypeOrmActivityLogRepository,
    },
    {
      provide: 'IStatisticsRepository',
      useClass: TypeOrmStatisticsRepository,
    },
  ],
  exports: ['IActivityLogRepository', 'IStatisticsRepository'],
})
export class AnalyticsRepositoriesModule {}
