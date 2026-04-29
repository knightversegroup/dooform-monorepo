import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { DeleteBrandingWatermarkUseCase } from './delete-branding-watermark.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [DeleteBrandingWatermarkUseCase],
  exports: [DeleteBrandingWatermarkUseCase],
})
export class DeleteBrandingWatermarkUseCaseModule {}
