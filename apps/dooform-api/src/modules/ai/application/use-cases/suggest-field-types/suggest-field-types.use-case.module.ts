import { Module } from '@nestjs/common'

import { TyphoonModule } from '../../services/typhoon.module'

import { SuggestFieldTypesUseCase } from './suggest-field-types.use-case'

@Module({
  imports: [TyphoonModule],
  providers: [SuggestFieldTypesUseCase],
  exports: [SuggestFieldTypesUseCase],
})
export class SuggestFieldTypesUseCaseModule {}
