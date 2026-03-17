import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { TemplateRepositoriesModule } from '../../../../template/infrastructure/persistence/typeorm/template-repositories.module'
import { LibreOfficeModule } from '../../../../libreoffice'

import { ProcessTemplateUseCase } from './process-template.use-case'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { ConversionService } from '../../services/conversion.service'
import { StorageService } from '../../services/storage.service'

@Module({
  imports: [
    DocumentRepositoriesModule,
    TemplateRepositoriesModule,
    LibreOfficeModule,
  ],
  providers: [
    ProcessTemplateUseCase,
    DocxProcessorService,
    ConversionService,
    StorageService,
  ],
  exports: [ProcessTemplateUseCase],
})
export class ProcessTemplateUseCaseModule {}
