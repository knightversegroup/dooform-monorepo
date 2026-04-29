import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { DeleteDocumentUseCase } from './delete-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [DeleteDocumentUseCase],
  exports: [DeleteDocumentUseCase],
})
export class DeleteDocumentUseCaseModule {}
