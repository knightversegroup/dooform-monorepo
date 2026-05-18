import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'
import { AuthModule } from '../../../../auth/auth.module'

import { ReplaceTemplateHtmlUseCase } from './replace-template-html.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule, AuthModule],
  providers: [ReplaceTemplateHtmlUseCase],
  exports: [ReplaceTemplateHtmlUseCase],
})
export class ReplaceTemplateHtmlUseCaseModule {}
