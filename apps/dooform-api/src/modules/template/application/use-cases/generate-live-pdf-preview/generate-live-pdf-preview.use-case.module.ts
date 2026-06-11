import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'

import { GenerateLivePdfPreviewUseCase } from './generate-live-pdf-preview.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule],
  providers: [GenerateLivePdfPreviewUseCase],
  exports: [GenerateLivePdfPreviewUseCase],
})
export class GenerateLivePdfPreviewUseCaseModule {}
