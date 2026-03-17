import { Module } from '@nestjs/common'

import { ProcessTemplateUseCaseModule } from '../application/use-cases/process-template/process-template.use-case.module'
import { GetDocumentUseCaseModule } from '../application/use-cases/get-document/get-document.use-case.module'
import { DownloadDocumentUseCaseModule } from '../application/use-cases/download-document/download-document.use-case.module'
import { DeleteDocumentUseCaseModule } from '../application/use-cases/delete-document/delete-document.use-case.module'
import { RegenerateDocumentUseCaseModule } from '../application/use-cases/regenerate-document/regenerate-document.use-case.module'
import { GetDocumentHistoryUseCaseModule } from '../application/use-cases/get-document-history/get-document-history.use-case.module'

import { DocumentController } from './rest/controllers/document.controller'

@Module({
  imports: [
    ProcessTemplateUseCaseModule,
    GetDocumentUseCaseModule,
    DownloadDocumentUseCaseModule,
    DeleteDocumentUseCaseModule,
    RegenerateDocumentUseCaseModule,
    GetDocumentHistoryUseCaseModule,
  ],
  controllers: [DocumentController],
})
export class DocumentInterfaceModule {}
