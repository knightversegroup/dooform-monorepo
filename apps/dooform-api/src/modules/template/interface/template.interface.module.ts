import { Module } from '@nestjs/common'

import { CreateTemplateUseCaseModule } from '../application/use-cases/create-template/create-template.use-case.module'
import { GetTemplateByIdUseCaseModule } from '../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'
import { GetAllTemplatesUseCaseModule } from '../application/use-cases/get-all-templates/get-all-templates.use-case.module'
import { UpdateTemplateUseCaseModule } from '../application/use-cases/update-template/update-template.use-case.module'
import { DeleteTemplateUseCaseModule } from '../application/use-cases/delete-template/delete-template.use-case.module'
import { FieldDefinitionsUseCaseModule } from '../application/use-cases/field-definitions/field-definitions.use-case.module'
import { GetGroupedTemplatesUseCaseModule } from '../application/use-cases/get-grouped-templates/get-grouped-templates.use-case.module'
import { DocumentTypeUseCaseModule } from '../application/use-cases/document-type/document-type.use-case.module'
import { TemplateRepositoriesModule } from '../infrastructure/persistence/typeorm/template-repositories.module'
import { LibreOfficeModule } from '../../libreoffice'
import { StorageService } from '../../document/application/services/storage.service'
import { DocxProcessorService } from '../application/services/docx-processor.service'

import { TemplateController } from './rest/controllers/template.controller'
import { DocumentTypeController } from './rest/controllers/document-type.controller'

@Module({
  imports: [
    CreateTemplateUseCaseModule,
    GetTemplateByIdUseCaseModule,
    GetAllTemplatesUseCaseModule,
    UpdateTemplateUseCaseModule,
    DeleteTemplateUseCaseModule,
    FieldDefinitionsUseCaseModule,
    GetGroupedTemplatesUseCaseModule,
    DocumentTypeUseCaseModule,
    TemplateRepositoriesModule,
    LibreOfficeModule,
  ],
  controllers: [TemplateController, DocumentTypeController],
  providers: [StorageService, DocxProcessorService],
})
export class TemplateInterfaceModule {}
