import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { GetCollectionUseCase } from './get-collection.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [GetCollectionUseCase],
  exports: [GetCollectionUseCase],
})
export class GetCollectionUseCaseModule {}
