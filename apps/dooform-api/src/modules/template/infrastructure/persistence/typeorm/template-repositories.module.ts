import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { TemplateModel } from './models/template.model'
import { DocumentTypeModel } from './models/document-type.model'
import { TypeOrmTemplateRepository } from './repositories/template.repository'
import { TypeOrmDocumentTypeRepository } from './repositories/document-type.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateModel, DocumentTypeModel]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'ITemplateRepository',
      useClass: TypeOrmTemplateRepository,
    },
    {
      provide: 'IDocumentTypeRepository',
      useClass: TypeOrmDocumentTypeRepository,
    },
  ],
  exports: ['ITemplateRepository', 'IDocumentTypeRepository'],
})
export class TemplateRepositoriesModule {}
