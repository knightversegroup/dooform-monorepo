import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { GetAnnotationsUseCase } from './get-annotations.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [GetAnnotationsUseCase],
  exports: [GetAnnotationsUseCase],
})
export class GetAnnotationsUseCaseModule {}
