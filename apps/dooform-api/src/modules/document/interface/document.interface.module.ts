import { Module } from '@nestjs/common'

import { DocumentController } from './rest/controllers/document.controller'
import { AnnotationController } from './rest/controllers/annotation.controller'
import { WatermarkPresetController } from './rest/controllers/watermark-preset.controller'
import { BrandingWatermarkController } from './rest/controllers/branding-watermark.controller'

@Module({
  controllers: [DocumentController, AnnotationController, WatermarkPresetController, BrandingWatermarkController],
})
export class DocumentInterfaceModule {}
