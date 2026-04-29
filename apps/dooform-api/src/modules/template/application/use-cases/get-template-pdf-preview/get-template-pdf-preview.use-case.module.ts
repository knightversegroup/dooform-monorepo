import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'

import { GetTemplatePdfPreviewUseCase } from './get-template-pdf-preview.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule],
  providers: [GetTemplatePdfPreviewUseCase],
  exports: [GetTemplatePdfPreviewUseCase],
})
export class GetTemplatePdfPreviewUseCaseModule {}
