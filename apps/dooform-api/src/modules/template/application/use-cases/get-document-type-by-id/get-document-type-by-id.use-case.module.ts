import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetDocumentTypeByIdUseCase } from './get-document-type-by-id.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetDocumentTypeByIdUseCase],
  exports: [GetDocumentTypeByIdUseCase],
})
export class GetDocumentTypeByIdUseCaseModule {}
