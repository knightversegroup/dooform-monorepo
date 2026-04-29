import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { ProcessDocumentUseCase } from './process-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [ProcessDocumentUseCase],
  exports: [ProcessDocumentUseCase],
})
export class ProcessDocumentUseCaseModule {}
