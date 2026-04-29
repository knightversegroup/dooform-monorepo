import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetDocumentTypeByCodeUseCase } from './get-document-type-by-code.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetDocumentTypeByCodeUseCase],
  exports: [GetDocumentTypeByCodeUseCase],
})
export class GetDocumentTypeByCodeUseCaseModule {}
