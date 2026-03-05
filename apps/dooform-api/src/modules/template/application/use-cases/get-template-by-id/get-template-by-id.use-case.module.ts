import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetTemplateByIdUseCase } from './get-template-by-id.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetTemplateByIdUseCase],
  exports: [GetTemplateByIdUseCase],
})
export class GetTemplateByIdUseCaseModule {}
