import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { StorageService } from '../../../../document/application/services/storage.service'

import { CreateTemplateUseCase } from './create-template.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [CreateTemplateUseCase, DocxProcessorService, StorageService],
  exports: [CreateTemplateUseCase],
})
export class CreateTemplateUseCaseModule {}
