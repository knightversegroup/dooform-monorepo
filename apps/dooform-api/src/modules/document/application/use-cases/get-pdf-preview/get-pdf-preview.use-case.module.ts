import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { GetPdfPreviewUseCase } from './get-pdf-preview.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [GetPdfPreviewUseCase],
  exports: [GetPdfPreviewUseCase],
})
export class GetPdfPreviewUseCaseModule {}
