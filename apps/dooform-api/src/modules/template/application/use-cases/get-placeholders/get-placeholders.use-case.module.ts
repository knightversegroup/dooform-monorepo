import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetPlaceholdersUseCase } from './get-placeholders.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetPlaceholdersUseCase],
  exports: [GetPlaceholdersUseCase],
})
export class GetPlaceholdersUseCaseModule {}
