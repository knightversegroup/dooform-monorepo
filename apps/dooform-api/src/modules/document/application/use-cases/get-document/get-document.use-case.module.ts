import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { GetDocumentUseCase } from './get-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [GetDocumentUseCase],
  exports: [GetDocumentUseCase],
})
export class GetDocumentUseCaseModule {}
