import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { DeleteDocumentSignatureUseCase } from './delete-document-signature.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [DeleteDocumentSignatureUseCase],
  exports: [DeleteDocumentSignatureUseCase],
})
export class DeleteDocumentSignatureUseCaseModule {}
