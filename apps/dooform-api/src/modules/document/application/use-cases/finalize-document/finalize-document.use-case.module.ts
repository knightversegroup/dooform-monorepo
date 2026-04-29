import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { FinalizeDocumentUseCase } from './finalize-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [FinalizeDocumentUseCase],
  exports: [FinalizeDocumentUseCase],
})
export class FinalizeDocumentUseCaseModule {}
