import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'
import { AuthModule } from '../../../../auth/auth.module'

import { ProcessDocumentUseCase } from './process-document.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule, AuthModule],
  providers: [ProcessDocumentUseCase],
  exports: [ProcessDocumentUseCase],
})
export class ProcessDocumentUseCaseModule {}
