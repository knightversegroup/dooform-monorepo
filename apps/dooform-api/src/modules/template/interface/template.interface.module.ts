import { Module } from '@nestjs/common'

import { CreateTemplateUseCaseModule } from '../application/use-cases/create-template/create-template.use-case.module'
import { GetTemplateByIdUseCaseModule } from '../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'
import { GetAllTemplatesUseCaseModule } from '../application/use-cases/get-all-templates/get-all-templates.use-case.module'
import { UpdateTemplateUseCaseModule } from '../application/use-cases/update-template/update-template.use-case.module'
import { DeleteTemplateUseCaseModule } from '../application/use-cases/delete-template/delete-template.use-case.module'
import { PublishTemplateUseCaseModule } from '../application/use-cases/publish-template/publish-template.use-case.module'
import { ArchiveTemplateUseCaseModule } from '../application/use-cases/archive-template/archive-template.use-case.module'
import { ReplaceTemplateFilesUseCaseModule } from '../application/use-cases/replace-template-files/replace-template-files.use-case.module'
import { GetPlaceholdersUseCaseModule } from '../application/use-cases/get-placeholders/get-placeholders.use-case.module'
import { GetFieldDefinitionsUseCaseModule } from '../application/use-cases/get-field-definitions/get-field-definitions.use-case.module'
import { UpdateFieldDefinitionsUseCaseModule } from '../application/use-cases/update-field-definitions/update-field-definitions.use-case.module'
import { RegenerateFieldDefinitionsUseCaseModule } from '../application/use-cases/regenerate-field-definitions/regenerate-field-definitions.use-case.module'
import { GetTemplateHtmlPreviewUseCaseModule } from '../application/use-cases/get-template-html-preview/get-template-html-preview.use-case.module'
import { GetTemplatePdfPreviewUseCaseModule } from '../application/use-cases/get-template-pdf-preview/get-template-pdf-preview.use-case.module'
import { GetTemplateThumbnailUseCaseModule } from '../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case.module'
// DocumentType use cases
import { CreateDocumentTypeUseCaseModule } from '../application/use-cases/create-document-type/create-document-type.use-case.module'
import { GetAllDocumentTypesUseCaseModule } from '../application/use-cases/get-all-document-types/get-all-document-types.use-case.module'
import { GetDocumentTypeByIdUseCaseModule } from '../application/use-cases/get-document-type-by-id/get-document-type-by-id.use-case.module'
import { GetDocumentTypeByCodeUseCaseModule } from '../application/use-cases/get-document-type-by-code/get-document-type-by-code.use-case.module'
import { UpdateDocumentTypeUseCaseModule } from '../application/use-cases/update-document-type/update-document-type.use-case.module'
import { DeleteDocumentTypeUseCaseModule } from '../application/use-cases/delete-document-type/delete-document-type.use-case.module'
import { GetDocumentTypeCategoriesUseCaseModule } from '../application/use-cases/get-document-type-categories/get-document-type-categories.use-case.module'
import { GetTemplatesByDocumentTypeUseCaseModule } from '../application/use-cases/get-templates-by-document-type/get-templates-by-document-type.use-case.module'
import { AssignTemplateToDocumentTypeUseCaseModule } from '../application/use-cases/assign-template-to-document-type/assign-template-to-document-type.use-case.module'
import { BulkAssignTemplatesUseCaseModule } from '../application/use-cases/bulk-assign-templates/bulk-assign-templates.use-case.module'
import { UnassignTemplateFromDocumentTypeUseCaseModule } from '../application/use-cases/unassign-template-from-document-type/unassign-template-from-document-type.use-case.module'

import { TemplateController } from './rest/controllers/template.controller'
import { DocumentTypeController } from './rest/controllers/document-type.controller'

@Module({
  imports: [
    // Template use cases
    CreateTemplateUseCaseModule,
    GetTemplateByIdUseCaseModule,
    GetAllTemplatesUseCaseModule,
    UpdateTemplateUseCaseModule,
    DeleteTemplateUseCaseModule,
    PublishTemplateUseCaseModule,
    ArchiveTemplateUseCaseModule,
    ReplaceTemplateFilesUseCaseModule,
    GetPlaceholdersUseCaseModule,
    GetFieldDefinitionsUseCaseModule,
    UpdateFieldDefinitionsUseCaseModule,
    RegenerateFieldDefinitionsUseCaseModule,
    GetTemplateHtmlPreviewUseCaseModule,
    GetTemplatePdfPreviewUseCaseModule,
    GetTemplateThumbnailUseCaseModule,
    // DocumentType use cases
    CreateDocumentTypeUseCaseModule,
    GetAllDocumentTypesUseCaseModule,
    GetDocumentTypeByIdUseCaseModule,
    GetDocumentTypeByCodeUseCaseModule,
    UpdateDocumentTypeUseCaseModule,
    DeleteDocumentTypeUseCaseModule,
    GetDocumentTypeCategoriesUseCaseModule,
    GetTemplatesByDocumentTypeUseCaseModule,
    AssignTemplateToDocumentTypeUseCaseModule,
    BulkAssignTemplatesUseCaseModule,
    UnassignTemplateFromDocumentTypeUseCaseModule,
  ],
  controllers: [TemplateController, DocumentTypeController],
})
export class TemplateInterfaceModule {}
