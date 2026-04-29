import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { BulkAssignTemplatesUseCase } from './bulk-assign-templates.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [BulkAssignTemplatesUseCase],
  exports: [BulkAssignTemplatesUseCase],
})
export class BulkAssignTemplatesUseCaseModule {}
