import { Module } from '@nestjs/common'

import { WorkflowRepositoriesModule } from '../../../infrastructure/persistence/typeorm/workflow-repositories.module'
import { ListDocumentSharesUseCase } from './list-document-shares.use-case'

@Module({
  imports: [WorkflowRepositoriesModule],
  providers: [ListDocumentSharesUseCase],
  exports: [ListDocumentSharesUseCase],
})
export class ListDocumentSharesUseCaseModule {}
