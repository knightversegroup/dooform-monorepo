import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { DeleteDocumentUseCase } from './delete-document.use-case'
import { StorageService } from '../../services/storage.service'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [
    DeleteDocumentUseCase,
    StorageService,
  ],
  exports: [DeleteDocumentUseCase],
})
export class DeleteDocumentUseCaseModule {}
