import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'
import { AuthModule } from '../../../../auth/auth.module'

import { DownloadDocumentUseCase } from './download-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule, AuthModule],
  providers: [DownloadDocumentUseCase],
  exports: [DownloadDocumentUseCase],
})
export class DownloadDocumentUseCaseModule {}
