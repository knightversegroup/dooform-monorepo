import { Module } from '@nestjs/common'

import { DictionaryRepositoriesModule } from '../../../infrastructure/persistence/typeorm/dictionary-repositories.module'

import { CreateEntryUseCase } from './create-entry.use-case'

@Module({
  imports: [DictionaryRepositoriesModule],
  providers: [CreateEntryUseCase],
  exports: [CreateEntryUseCase],
})
export class CreateEntryUseCaseModule {}
