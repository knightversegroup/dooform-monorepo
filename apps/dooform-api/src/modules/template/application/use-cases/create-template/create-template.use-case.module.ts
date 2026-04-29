import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocumentServicesModule } from '../../../../document/infrastructure/services/document-services.module'
import { TemplateServicesModule } from '../../../infrastructure/services/template-services.module'

import { CreateTemplateUseCase } from './create-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, DocumentServicesModule, TemplateServicesModule],
  providers: [CreateTemplateUseCase],
  exports: [CreateTemplateUseCase],
})
export class CreateTemplateUseCaseModule {}
