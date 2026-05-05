import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { ListDocumentActivitiesUseCase } from './list-document-activities.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [ListDocumentActivitiesUseCase],
  exports: [ListDocumentActivitiesUseCase],
})
export class ListDocumentActivitiesUseCaseModule {}
