import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { ListDocumentSignaturesUseCase } from './list-document-signatures.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [ListDocumentSignaturesUseCase],
  exports: [ListDocumentSignaturesUseCase],
})
export class ListDocumentSignaturesUseCaseModule {}
