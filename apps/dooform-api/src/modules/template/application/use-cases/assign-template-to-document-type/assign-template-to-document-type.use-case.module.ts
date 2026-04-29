import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { AssignTemplateToDocumentTypeUseCase } from './assign-template-to-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [AssignTemplateToDocumentTypeUseCase],
  exports: [AssignTemplateToDocumentTypeUseCase],
})
export class AssignTemplateToDocumentTypeUseCaseModule {}
