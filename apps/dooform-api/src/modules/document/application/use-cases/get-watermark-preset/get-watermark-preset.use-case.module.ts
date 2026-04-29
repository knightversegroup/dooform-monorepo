import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { GetWatermarkPresetUseCase } from './get-watermark-preset.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [GetWatermarkPresetUseCase],
  exports: [GetWatermarkPresetUseCase],
})
export class GetWatermarkPresetUseCaseModule {}
