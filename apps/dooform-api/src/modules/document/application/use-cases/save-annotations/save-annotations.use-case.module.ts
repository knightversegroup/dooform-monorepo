import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { SaveAnnotationsUseCase } from './save-annotations.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [SaveAnnotationsUseCase],
  exports: [SaveAnnotationsUseCase],
})
export class SaveAnnotationsUseCaseModule {}
