import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'
import { TemplateServicesModule } from '../../../infrastructure/services/template-services.module'

import { ReplaceTemplateFilesUseCase } from './replace-template-files.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule, TemplateServicesModule],
  providers: [ReplaceTemplateFilesUseCase],
  exports: [ReplaceTemplateFilesUseCase],
})
export class ReplaceTemplateFilesUseCaseModule {}
