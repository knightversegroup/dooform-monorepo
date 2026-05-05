import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { MarkAllNotificationsReadUseCase } from './mark-all-notifications-read.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [MarkAllNotificationsReadUseCase],
  exports: [MarkAllNotificationsReadUseCase],
})
export class MarkAllNotificationsReadUseCaseModule {}
