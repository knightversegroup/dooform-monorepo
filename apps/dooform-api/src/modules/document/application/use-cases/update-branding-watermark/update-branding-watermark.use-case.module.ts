import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { UpdateBrandingWatermarkUseCase } from './update-branding-watermark.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [UpdateBrandingWatermarkUseCase],
  exports: [UpdateBrandingWatermarkUseCase],
})
export class UpdateBrandingWatermarkUseCaseModule {}
