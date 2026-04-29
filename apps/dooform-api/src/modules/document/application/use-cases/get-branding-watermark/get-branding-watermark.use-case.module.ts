import { Module } from '@nestjs/common'

import { DocumentRepositoriesModule } from '../../../infrastructure/persistence/typeorm/document-repositories.module'

import { GetBrandingWatermarkUseCase } from './get-branding-watermark.use-case'

@Module({
  imports: [DocumentRepositoriesModule],
  providers: [GetBrandingWatermarkUseCase],
  exports: [GetBrandingWatermarkUseCase],
})
export class GetBrandingWatermarkUseCaseModule {}
