import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { DeleteDocumentCommentUseCase } from './delete-document-comment.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [DeleteDocumentCommentUseCase],
  exports: [DeleteDocumentCommentUseCase],
})
export class DeleteDocumentCommentUseCaseModule {}
