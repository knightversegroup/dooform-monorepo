import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetAllTemplatesUseCase } from './get-all-templates.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetAllTemplatesUseCase],
  exports: [GetAllTemplatesUseCase],
})
export class GetAllTemplatesUseCaseModule {}
