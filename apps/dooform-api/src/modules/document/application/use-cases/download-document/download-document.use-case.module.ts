import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { DownloadDocumentUseCase } from './download-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [DownloadDocumentUseCase],
  exports: [DownloadDocumentUseCase],
})
export class DownloadDocumentUseCaseModule {}
