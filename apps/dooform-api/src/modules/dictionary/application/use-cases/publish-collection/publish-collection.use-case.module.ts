import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { PublishCollectionUseCase } from './publish-collection.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [PublishCollectionUseCase],
  exports: [PublishCollectionUseCase],
})
export class PublishCollectionUseCaseModule {}
