import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { LibreOfficeModule } from '../../../../libreoffice'

import { DownloadDocumentUseCase } from './download-document.use-case'
import { ConversionService } from '../../services/conversion.service'
import { StorageService } from '../../services/storage.service'

@Module({
  imports: [
    DocumentRepositoriesModule,
    LibreOfficeModule,
  ],
  providers: [
    DownloadDocumentUseCase,
    ConversionService,
    StorageService,
  ],
  exports: [DownloadDocumentUseCase],
})
export class DownloadDocumentUseCaseModule {}
