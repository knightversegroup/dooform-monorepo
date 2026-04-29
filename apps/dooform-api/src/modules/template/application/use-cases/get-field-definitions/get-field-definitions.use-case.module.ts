import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetFieldDefinitionsUseCase } from './get-field-definitions.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetFieldDefinitionsUseCase],
  exports: [GetFieldDefinitionsUseCase],
})
export class GetFieldDefinitionsUseCaseModule {}
