import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { MarkNotificationReadUseCase } from './mark-notification-read.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [MarkNotificationReadUseCase],
  exports: [MarkNotificationReadUseCase],
})
export class MarkNotificationReadUseCaseModule {}
