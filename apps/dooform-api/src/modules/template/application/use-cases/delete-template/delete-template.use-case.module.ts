import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { DeleteTemplateUseCase } from './delete-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [DeleteTemplateUseCase],
  exports: [DeleteTemplateUseCase],
})
export class DeleteTemplateUseCaseModule {}
