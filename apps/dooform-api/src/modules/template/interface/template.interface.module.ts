import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TemplateTaxonomyService } from '../application/services/template-taxonomy.service'
import { TemplateTaxonomyModel } from '../infrastructure/persistence/typeorm/models/template-taxonomy.model'

import { TemplateController } from './rest/controllers/template.controller'
import { DocumentTypeController } from './rest/controllers/document-type.controller'
import { TemplateTaxonomyController } from './rest/controllers/template-taxonomy.controller'
import { PublicFormsController } from './rest/controllers/public-forms.controller'

@Module({
  imports: [TypeOrmModule.forFeature([TemplateTaxonomyModel])],
  controllers: [
    TemplateController,
    DocumentTypeController,
    TemplateTaxonomyController,
    PublicFormsController,
  ],
  providers: [TemplateTaxonomyService],
  exports: [TemplateTaxonomyService],
})
export class TemplateInterfaceModule {}
