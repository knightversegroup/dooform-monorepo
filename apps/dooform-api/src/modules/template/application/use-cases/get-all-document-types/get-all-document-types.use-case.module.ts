import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetAllDocumentTypesUseCase } from './get-all-document-types.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetAllDocumentTypesUseCase],
  exports: [GetAllDocumentTypesUseCase],
})
export class GetAllDocumentTypesUseCaseModule {}
