import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { CreateDocumentShareUseCase } from './create-document-share.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [CreateDocumentShareUseCase],
  exports: [CreateDocumentShareUseCase],
})
export class CreateDocumentShareUseCaseModule {}
