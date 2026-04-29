import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { UnassignTemplateFromDocumentTypeUseCase } from './unassign-template-from-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [UnassignTemplateFromDocumentTypeUseCase],
  exports: [UnassignTemplateFromDocumentTypeUseCase],
})
export class UnassignTemplateFromDocumentTypeUseCaseModule {}
