import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { UpdateEntryUseCase } from './update-entry.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [UpdateEntryUseCase],
  exports: [UpdateEntryUseCase],
})
export class UpdateEntryUseCaseModule {}
