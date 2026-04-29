import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { GetDocumentHistoryUseCase } from './get-document-history.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [GetDocumentHistoryUseCase],
  exports: [GetDocumentHistoryUseCase],
})
export class GetDocumentHistoryUseCaseModule {}
