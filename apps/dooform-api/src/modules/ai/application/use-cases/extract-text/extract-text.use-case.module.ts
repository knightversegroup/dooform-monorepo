import { Module } from '@nestjs/common'

import { TyphoonModule } from '../../services/typhoon.module'

import { ExtractTextUseCase } from './extract-text.use-case'

@Module({
  imports: [TyphoonModule],
  providers: [ExtractTextUseCase],
  exports: [ExtractTextUseCase],
})
export class ExtractTextUseCaseModule {}
