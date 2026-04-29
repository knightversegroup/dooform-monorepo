import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetDocumentTypeCategoriesUseCase } from './get-document-type-categories.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetDocumentTypeCategoriesUseCase],
  exports: [GetDocumentTypeCategoriesUseCase],
})
export class GetDocumentTypeCategoriesUseCaseModule {}
