import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'
import { DocumentServicesModule } from '../../../infrastructure/services/document-services.module'

import { UploadWatermarkLogoUseCase } from './upload-watermark-logo.use-case'

@Module({
  imports: [DocumentRepositoriesModule, DocumentServicesModule],
  providers: [UploadWatermarkLogoUseCase],
  exports: [UploadWatermarkLogoUseCase],
})
export class UploadWatermarkLogoUseCaseModule {}
