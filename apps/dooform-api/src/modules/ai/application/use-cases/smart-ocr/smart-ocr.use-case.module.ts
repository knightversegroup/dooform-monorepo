import { Module } from '@nestjs/common'

import { TyphoonModule } from '../../services/typhoon.module'

import { SmartOcrUseCase } from './smart-ocr.use-case'

@Module({
  imports: [TyphoonModule],
  providers: [SmartOcrUseCase],
  exports: [SmartOcrUseCase],
})
export class SmartOcrUseCaseModule {}
