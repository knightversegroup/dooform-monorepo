import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetTemplatesByDocumentTypeUseCase } from './get-templates-by-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetTemplatesByDocumentTypeUseCase],
  exports: [GetTemplatesByDocumentTypeUseCase],
})
export class GetTemplatesByDocumentTypeUseCaseModule {}
