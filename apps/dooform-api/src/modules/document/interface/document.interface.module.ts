import { Module } from '@nestjs/common'

import { ProcessDocumentUseCaseModule } from '../application/use-cases/process-document/process-document.use-case.module'
import { GetDocumentUseCaseModule } from '../application/use-cases/get-document/get-document.use-case.module'
import { DownloadDocumentUseCaseModule } from '../application/use-cases/download-document/download-document.use-case.module'
import { DeleteDocumentUseCaseModule } from '../application/use-cases/delete-document/delete-document.use-case.module'
import { GetDocumentHistoryUseCaseModule } from '../application/use-cases/get-document-history/get-document-history.use-case.module'
import { RegenerateDocumentUseCaseModule } from '../application/use-cases/regenerate-document/regenerate-document.use-case.module'
import { GetAnnotationsUseCaseModule } from '../application/use-cases/get-annotations/get-annotations.use-case.module'
import { SaveAnnotationsUseCaseModule } from '../application/use-cases/save-annotations/save-annotations.use-case.module'
import { FinalizeDocumentUseCaseModule } from '../application/use-cases/finalize-document/finalize-document.use-case.module'
import { GetPdfPreviewUseCaseModule } from '../application/use-cases/get-pdf-preview/get-pdf-preview.use-case.module'
import { CreateWatermarkPresetUseCaseModule } from '../application/use-cases/create-watermark-preset/create-watermark-preset.use-case.module'
import { UpdateWatermarkPresetUseCaseModule } from '../application/use-cases/update-watermark-preset/update-watermark-preset.use-case.module'
import { DeleteWatermarkPresetUseCaseModule } from '../application/use-cases/delete-watermark-preset/delete-watermark-preset.use-case.module'
import { ListWatermarkPresetsUseCaseModule } from '../application/use-cases/list-watermark-presets/list-watermark-presets.use-case.module'
import { GetWatermarkPresetUseCaseModule } from '../application/use-cases/get-watermark-preset/get-watermark-preset.use-case.module'
import { UploadWatermarkLogoUseCaseModule } from '../application/use-cases/upload-watermark-logo/upload-watermark-logo.use-case.module'
import { GetBrandingWatermarkUseCaseModule } from '../application/use-cases/get-branding-watermark/get-branding-watermark.use-case.module'
import { UpdateBrandingWatermarkUseCaseModule } from '../application/use-cases/update-branding-watermark/update-branding-watermark.use-case.module'
import { DeleteBrandingWatermarkUseCaseModule } from '../application/use-cases/delete-branding-watermark/delete-branding-watermark.use-case.module'
import { HealthCheckUseCaseModule } from '../application/use-cases/health-check/health-check.use-case.module'

import { DocumentController } from './rest/controllers/document.controller'
import { AnnotationController } from './rest/controllers/annotation.controller'
import { WatermarkPresetController } from './rest/controllers/watermark-preset.controller'
import { BrandingWatermarkController } from './rest/controllers/branding-watermark.controller'

@Module({
  imports: [
    // Document use cases
    ProcessDocumentUseCaseModule,
    GetDocumentUseCaseModule,
    DownloadDocumentUseCaseModule,
    DeleteDocumentUseCaseModule,
    GetDocumentHistoryUseCaseModule,
    RegenerateDocumentUseCaseModule,
    // Annotation use cases
    GetAnnotationsUseCaseModule,
    SaveAnnotationsUseCaseModule,
    FinalizeDocumentUseCaseModule,
    GetPdfPreviewUseCaseModule,
    // Watermark preset use cases
    CreateWatermarkPresetUseCaseModule,
    UpdateWatermarkPresetUseCaseModule,
    DeleteWatermarkPresetUseCaseModule,
    ListWatermarkPresetsUseCaseModule,
    GetWatermarkPresetUseCaseModule,
    UploadWatermarkLogoUseCaseModule,
    // Branding watermark use cases
    GetBrandingWatermarkUseCaseModule,
    UpdateBrandingWatermarkUseCaseModule,
    DeleteBrandingWatermarkUseCaseModule,
    // Health check
    HealthCheckUseCaseModule,
  ],
  controllers: [DocumentController, AnnotationController, WatermarkPresetController, BrandingWatermarkController],
})
export class DocumentInterfaceModule {}
