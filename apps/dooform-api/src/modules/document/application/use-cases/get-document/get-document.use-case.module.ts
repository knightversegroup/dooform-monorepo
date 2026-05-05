import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { WorkflowRepositoriesModule } from '../../../../workflow/infrastructure/persistence/typeorm/workflow-repositories.module'

import { GetDocumentUseCase } from './get-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, WorkflowRepositoriesModule],
  providers: [GetDocumentUseCase],
  exports: [GetDocumentUseCase],
})
export class GetDocumentUseCaseModule {}
