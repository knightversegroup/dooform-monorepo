import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { ListDocumentCommentsUseCase } from './list-document-comments.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [ListDocumentCommentsUseCase],
  exports: [ListDocumentCommentsUseCase],
})
export class ListDocumentCommentsUseCaseModule {}
