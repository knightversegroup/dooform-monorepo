import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { UnpublishTemplateUseCase } from './unpublish-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [UnpublishTemplateUseCase],
  exports: [UnpublishTemplateUseCase],
})
export class UnpublishTemplateUseCaseModule {}
