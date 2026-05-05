import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UnitOfWorkTypeOrmModule } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentModel } from './models/document.model'
import { DocumentAnnotationModel } from './models/document-annotation.model'
import { WatermarkPresetModel } from './models/watermark-preset.model'
import { SystemConfigModel } from './models/system-config.model'
import { DocumentShareModel } from '../../../../workflow/infrastructure/persistence/typeorm/models/document-share.model'
import { TypeOrmDocumentRepository } from './repositories/document.repository'
import { TypeOrmDocumentAnnotationRepository } from './repositories/document-annotation.repository'
import { TypeOrmWatermarkPresetRepository } from './repositories/watermark-preset.repository'
import { TypeOrmSystemConfigRepository } from './repositories/system-config.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentModel,
      DocumentAnnotationModel,
      WatermarkPresetModel,
      SystemConfigModel,
      // Used by TypeOrmDocumentRepository to filter history by `OR exists in shares`
      DocumentShareModel,
    ]),
    UnitOfWorkTypeOrmModule,
  ],
  providers: [
    {
      provide: 'IDocumentRepository',
      useClass: TypeOrmDocumentRepository,
    },
    {
      provide: 'IDocumentAnnotationRepository',
      useClass: TypeOrmDocumentAnnotationRepository,
    },
    {
      provide: 'IWatermarkPresetRepository',
      useClass: TypeOrmWatermarkPresetRepository,
    },
    {
      provide: 'ISystemConfigRepository',
      useClass: TypeOrmSystemConfigRepository,
    },
  ],
  exports: [
    'IDocumentRepository',
    'IDocumentAnnotationRepository',
    'IWatermarkPresetRepository',
    'ISystemConfigRepository',
  ],
})
export class DocumentRepositoriesModule {}
