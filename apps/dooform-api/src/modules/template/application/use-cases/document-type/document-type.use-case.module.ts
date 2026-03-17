import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import {
  GetDocumentTypesUseCase,
  GetDocumentTypeByIdUseCase,
  GetDocumentTypeByCodeUseCase,
  CreateDocumentTypeUseCase,
  UpdateDocumentTypeUseCase,
  DeleteDocumentTypeUseCase,
  GetCategoriesUseCase,
  AssignTemplateUseCase,
  UnassignTemplateUseCase,
  BulkAssignTemplatesUseCase,
  GetTemplatesByDocumentTypeUseCase,
} from './document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [
    GetDocumentTypesUseCase,
    GetDocumentTypeByIdUseCase,
    GetDocumentTypeByCodeUseCase,
    CreateDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    DeleteDocumentTypeUseCase,
    GetCategoriesUseCase,
    AssignTemplateUseCase,
    UnassignTemplateUseCase,
    BulkAssignTemplatesUseCase,
    GetTemplatesByDocumentTypeUseCase,
  ],
  exports: [
    GetDocumentTypesUseCase,
    GetDocumentTypeByIdUseCase,
    GetDocumentTypeByCodeUseCase,
    CreateDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    DeleteDocumentTypeUseCase,
    GetCategoriesUseCase,
    AssignTemplateUseCase,
    UnassignTemplateUseCase,
    BulkAssignTemplatesUseCase,
    GetTemplatesByDocumentTypeUseCase,
  ],
})
export class DocumentTypeUseCaseModule {}
