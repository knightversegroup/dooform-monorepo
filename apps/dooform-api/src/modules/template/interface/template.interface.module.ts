import { Module } from '@nestjs/common'

import { TemplateController } from './rest/controllers/template.controller'
import { DocumentTypeController } from './rest/controllers/document-type.controller'

@Module({
  controllers: [TemplateController, DocumentTypeController],
})
export class TemplateInterfaceModule {}
