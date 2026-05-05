import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { ActivityService } from './activity.service'
import { DocumentAccessService } from './document-access.service'
import { NotificationService } from './notification.service'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [DocumentAccessService, ActivityService, NotificationService],
  exports: [DocumentAccessService, ActivityService, NotificationService],
})
export class WorkflowDomainModule {}
