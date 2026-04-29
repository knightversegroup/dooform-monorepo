import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { ListWatermarkPresetsUseCase } from './list-watermark-presets.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [ListWatermarkPresetsUseCase],
  exports: [ListWatermarkPresetsUseCase],
})
export class ListWatermarkPresetsUseCaseModule {}
