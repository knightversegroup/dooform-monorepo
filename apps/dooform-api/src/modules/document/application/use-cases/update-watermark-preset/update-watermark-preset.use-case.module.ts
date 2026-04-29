import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { UpdateWatermarkPresetUseCase } from './update-watermark-preset.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [UpdateWatermarkPresetUseCase],
  exports: [UpdateWatermarkPresetUseCase],
})
export class UpdateWatermarkPresetUseCaseModule {}
