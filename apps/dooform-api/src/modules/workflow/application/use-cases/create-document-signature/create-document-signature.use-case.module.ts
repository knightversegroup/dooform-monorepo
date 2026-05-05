import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { CreateDocumentSignatureUseCase } from './create-document-signature.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [CreateDocumentSignatureUseCase],
  exports: [CreateDocumentSignatureUseCase],
})
export class CreateDocumentSignatureUseCaseModule {}
