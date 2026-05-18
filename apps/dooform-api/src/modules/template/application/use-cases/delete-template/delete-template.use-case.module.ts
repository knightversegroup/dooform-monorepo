import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { DeleteTemplateUseCase } from './delete-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [DeleteTemplateUseCase],
  exports: [DeleteTemplateUseCase],
})
export class DeleteTemplateUseCaseModule {}
