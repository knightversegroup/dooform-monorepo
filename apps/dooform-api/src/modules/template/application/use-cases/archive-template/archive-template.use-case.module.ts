import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { ArchiveTemplateUseCase } from './archive-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [ArchiveTemplateUseCase],
  exports: [ArchiveTemplateUseCase],
})
export class ArchiveTemplateUseCaseModule {}
