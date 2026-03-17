import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { StorageService } from '../../../../document/application/services/storage.service'

import { DeleteTemplateUseCase } from './delete-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [DeleteTemplateUseCase, StorageService],
  exports: [DeleteTemplateUseCase],
})
export class DeleteTemplateUseCaseModule {}
