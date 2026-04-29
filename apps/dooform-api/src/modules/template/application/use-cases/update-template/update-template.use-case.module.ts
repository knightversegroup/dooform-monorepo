import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { UpdateTemplateUseCase } from './update-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [UpdateTemplateUseCase],
  exports: [UpdateTemplateUseCase],
})
export class UpdateTemplateUseCaseModule {}
