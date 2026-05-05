import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { CreateCollectionUseCase } from './create-collection.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [CreateCollectionUseCase],
  exports: [CreateCollectionUseCase],
})
export class CreateCollectionUseCaseModule {}
