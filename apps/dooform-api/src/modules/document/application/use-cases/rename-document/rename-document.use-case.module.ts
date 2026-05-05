import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { WorkflowRepositoriesModule } from '../../../../workflow/infrastructure/persistence/typeorm/workflow-repositories.module'

import { RenameDocumentUseCase } from './rename-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, WorkflowRepositoriesModule],
  providers: [RenameDocumentUseCase],
  exports: [RenameDocumentUseCase],
})
export class RenameDocumentUseCaseModule {}
