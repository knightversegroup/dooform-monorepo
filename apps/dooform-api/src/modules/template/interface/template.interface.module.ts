import { Module } from '@nestjs/common'

import { CreateTemplateUseCaseModule } from '../application/use-cases/create-template/create-template.use-case.module'
import { GetTemplateByIdUseCaseModule } from '../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'
import { GetAllTemplatesUseCaseModule } from '../application/use-cases/get-all-templates/get-all-templates.use-case.module'

import { TemplateController } from './rest/controllers/template.controller'

@Module({
  imports: [
    CreateTemplateUseCaseModule,
    GetTemplateByIdUseCaseModule,
    GetAllTemplatesUseCaseModule,
  ],
  controllers: [TemplateController],
})
export class TemplateInterfaceModule {}
