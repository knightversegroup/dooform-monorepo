import { Module } from '@nestjs/common'

import { TyphoonModule } from '../../services/typhoon.module'

import { SuggestAliasesUseCase } from './suggest-aliases.use-case'

@Module({
  imports: [TyphoonModule],
  providers: [SuggestAliasesUseCase],
  exports: [SuggestAliasesUseCase],
})
export class SuggestAliasesUseCaseModule {}
