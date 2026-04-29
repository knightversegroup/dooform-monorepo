import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { DeleteWatermarkPresetUseCase } from './delete-watermark-preset.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [DeleteWatermarkPresetUseCase],
  exports: [DeleteWatermarkPresetUseCase],
})
export class DeleteWatermarkPresetUseCaseModule {}
