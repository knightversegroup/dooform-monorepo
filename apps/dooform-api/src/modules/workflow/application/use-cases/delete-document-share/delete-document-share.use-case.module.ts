import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { DeleteDocumentShareUseCase } from './delete-document-share.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [DeleteDocumentShareUseCase],
  exports: [DeleteDocumentShareUseCase],
})
export class DeleteDocumentShareUseCaseModule {}
