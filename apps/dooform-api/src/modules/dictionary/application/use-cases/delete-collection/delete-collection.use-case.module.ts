import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'
import { DictionaryEntryModel } from '../../../infrastructure/persistence/typeorm/models/dictionary-entry.model'

import { DeleteCollectionUseCase } from './delete-collection.use-case'

@Module({
  imports: [DictionaryRepositoriesModule, TypeOrmModule.forFeature([DictionaryEntryModel])],
  providers: [DeleteCollectionUseCase],
  exports: [DeleteCollectionUseCase],
})
export class DeleteCollectionUseCaseModule {}
