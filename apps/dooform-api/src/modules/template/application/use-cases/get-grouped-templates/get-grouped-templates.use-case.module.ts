import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetGroupedTemplatesUseCase } from './get-grouped-templates.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetGroupedTemplatesUseCase],
  exports: [GetGroupedTemplatesUseCase],
})
export class GetGroupedTemplatesUseCaseModule {}
