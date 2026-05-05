import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DictionaryCollectionModel } from './models/dictionary-collection.model'
import { DictionaryEntryModel } from './models/dictionary-entry.model'
import { TypeOrmDictionaryCollectionRepository } from './repositories/dictionary-collection.repository'
import { TypeOrmDictionaryEntryRepository } from './repositories/dictionary-entry.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([DictionaryCollectionModel, DictionaryEntryModel]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'IDictionaryCollectionRepository',
      useClass: TypeOrmDictionaryCollectionRepository,
    },
    {
      provide: 'IDictionaryEntryRepository',
      useClass: TypeOrmDictionaryEntryRepository,
    },
  ],
  exports: ['IDictionaryCollectionRepository', 'IDictionaryEntryRepository'],
})
export class DictionaryRepositoriesModule {}
