import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { UpdateDocumentTypeUseCase } from './update-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [UpdateDocumentTypeUseCase],
  exports: [UpdateDocumentTypeUseCase],
})
export class UpdateDocumentTypeUseCaseModule {}
