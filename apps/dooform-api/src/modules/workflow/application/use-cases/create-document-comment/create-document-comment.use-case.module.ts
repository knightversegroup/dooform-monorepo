import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { CreateDocumentCommentUseCase } from './create-document-comment.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [CreateDocumentCommentUseCase],
  exports: [CreateDocumentCommentUseCase],
})
export class CreateDocumentCommentUseCaseModule {}
