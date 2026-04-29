import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { CreateDocumentTypeUseCase } from './create-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [CreateDocumentTypeUseCase],
  exports: [CreateDocumentTypeUseCase],
})
export class CreateDocumentTypeUseCaseModule {}
