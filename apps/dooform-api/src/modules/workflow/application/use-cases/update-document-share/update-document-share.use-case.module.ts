import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { WorkflowDomainModule } from '../../../domain/services/workflow-domain.module'
import { UpdateDocumentShareUseCase } from './update-document-share.use-case'

@Module({
  imports: [WorkflowRepositoriesModule, WorkflowDomainModule],
  providers: [UpdateDocumentShareUseCase],
  exports: [UpdateDocumentShareUseCase],
})
export class UpdateDocumentShareUseCaseModule {}
