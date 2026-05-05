import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { UpdateCollectionUseCase } from './update-collection.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [UpdateCollectionUseCase],
  exports: [UpdateCollectionUseCase],
})
export class UpdateCollectionUseCaseModule {}
