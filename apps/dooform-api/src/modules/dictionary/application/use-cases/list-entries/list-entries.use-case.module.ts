import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { ListEntriesUseCase } from './list-entries.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [ListEntriesUseCase],
  exports: [ListEntriesUseCase],
})
export class ListEntriesUseCaseModule {}
