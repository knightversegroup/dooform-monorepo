import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { DeleteEntryUseCase } from './delete-entry.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [DeleteEntryUseCase],
  exports: [DeleteEntryUseCase],
})
export class DeleteEntryUseCaseModule {}
