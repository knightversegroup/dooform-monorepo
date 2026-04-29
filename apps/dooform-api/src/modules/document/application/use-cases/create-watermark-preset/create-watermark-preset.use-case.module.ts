import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { CreateWatermarkPresetUseCase } from './create-watermark-preset.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [CreateWatermarkPresetUseCase],
  exports: [CreateWatermarkPresetUseCase],
})
export class CreateWatermarkPresetUseCaseModule {}
