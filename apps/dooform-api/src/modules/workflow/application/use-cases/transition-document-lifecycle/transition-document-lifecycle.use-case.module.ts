import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { TransitionDocumentLifecycleUseCase } from './transition-document-lifecycle.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [TransitionDocumentLifecycleUseCase],
  exports: [TransitionDocumentLifecycleUseCase],
})
export class TransitionDocumentLifecycleUseCaseModule {}
