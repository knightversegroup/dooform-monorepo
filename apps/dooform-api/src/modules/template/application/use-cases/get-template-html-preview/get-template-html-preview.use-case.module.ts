import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'

import { GetTemplateHtmlPreviewUseCase } from './get-template-html-preview.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule],
  providers: [GetTemplateHtmlPreviewUseCase],
  exports: [GetTemplateHtmlPreviewUseCase],
})
export class GetTemplateHtmlPreviewUseCaseModule {}
