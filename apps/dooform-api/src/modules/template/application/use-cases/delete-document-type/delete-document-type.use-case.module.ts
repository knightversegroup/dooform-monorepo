import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { DeleteDocumentTypeUseCase } from './delete-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [DeleteDocumentTypeUseCase],
  exports: [DeleteDocumentTypeUseCase],
})
export class DeleteDocumentTypeUseCaseModule {}
