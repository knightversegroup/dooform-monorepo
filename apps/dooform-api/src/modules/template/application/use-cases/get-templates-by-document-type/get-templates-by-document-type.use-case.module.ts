import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'
import { AuthModule } from '../../../../auth/auth.module'

import { GetTemplatesByDocumentTypeUseCase } from './get-templates-by-document-type.use-case'

@Module({
  imports: [TemplateRepositoriesModule, AuthModule],
  providers: [GetTemplatesByDocumentTypeUseCase],
  exports: [GetTemplatesByDocumentTypeUseCase],
})
export class GetTemplatesByDocumentTypeUseCaseModule {}
