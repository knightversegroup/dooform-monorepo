import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { CreateTemplateUseCase } from './create-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [CreateTemplateUseCase],
  exports: [CreateTemplateUseCase],
})
export class CreateTemplateUseCaseModule {}
