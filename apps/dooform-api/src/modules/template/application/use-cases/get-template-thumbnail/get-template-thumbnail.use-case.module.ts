import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'

import { GetTemplateThumbnailUseCase } from './get-template-thumbnail.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule],
  providers: [GetTemplateThumbnailUseCase],
  exports: [GetTemplateThumbnailUseCase],
})
export class GetTemplateThumbnailUseCaseModule {}
