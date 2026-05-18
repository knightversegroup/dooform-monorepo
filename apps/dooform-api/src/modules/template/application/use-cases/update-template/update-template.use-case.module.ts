import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { UpdateTemplateUseCase } from './update-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [UpdateTemplateUseCase],
  exports: [UpdateTemplateUseCase],
})
export class UpdateTemplateUseCaseModule {}
