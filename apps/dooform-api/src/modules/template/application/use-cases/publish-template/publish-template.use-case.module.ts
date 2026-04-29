import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { PublishTemplateUseCase } from './publish-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [PublishTemplateUseCase],
  exports: [PublishTemplateUseCase],
})
export class PublishTemplateUseCaseModule {}
