import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { PublishTemplateUseCase } from './publish-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [PublishTemplateUseCase],
  exports: [PublishTemplateUseCase],
})
export class PublishTemplateUseCaseModule {}
