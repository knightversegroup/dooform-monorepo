import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { ArchiveTemplateUseCase } from './archive-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [ArchiveTemplateUseCase],
  exports: [ArchiveTemplateUseCase],
})
export class ArchiveTemplateUseCaseModule {}
