import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { UpdateFieldDefinitionsUseCase } from './update-field-definitions.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [UpdateFieldDefinitionsUseCase],
  exports: [UpdateFieldDefinitionsUseCase],
})
export class UpdateFieldDefinitionsUseCaseModule {}
