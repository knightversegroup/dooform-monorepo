import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { DocxProcessorService } from '../../services/docx-processor.service'

import {
  GetFieldDefinitionsUseCase,
  UpdateFieldDefinitionsUseCase,
  RegenerateFieldDefinitionsUseCase,
} from './field-definitions.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [
    GetFieldDefinitionsUseCase,
    UpdateFieldDefinitionsUseCase,
    RegenerateFieldDefinitionsUseCase,
    DocxProcessorService,
  ],
  exports: [
    GetFieldDefinitionsUseCase,
    UpdateFieldDefinitionsUseCase,
    RegenerateFieldDefinitionsUseCase,
  ],
})
export class FieldDefinitionsUseCaseModule {}
