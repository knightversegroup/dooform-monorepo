import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'
import { TemplateRepositoriesModule } from '../../../../template/infrastructure/persistence/typeorm/template-repositories.module'
import { WorkflowRepositoriesModule } from '../../../../workflow/infrastructure/persistence/typeorm/workflow-repositories.module'

import { RegenerateDocumentUseCase } from './regenerate-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule, TemplateRepositoriesModule, WorkflowRepositoriesModule],
  providers: [RegenerateDocumentUseCase],
  exports: [RegenerateDocumentUseCase],
})
export class RegenerateDocumentUseCaseModule {}
