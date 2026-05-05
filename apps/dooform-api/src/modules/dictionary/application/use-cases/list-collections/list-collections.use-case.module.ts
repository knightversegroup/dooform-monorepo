import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { ListCollectionsUseCase } from './list-collections.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [ListCollectionsUseCase],
  exports: [ListCollectionsUseCase],
})
export class ListCollectionsUseCaseModule {}
