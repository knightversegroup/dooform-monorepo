import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { ListNotificationsUseCase } from './list-notifications.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [ListNotificationsUseCase],
  exports: [ListNotificationsUseCase],
})
export class ListNotificationsUseCaseModule {}
