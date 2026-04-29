import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { DocxtemplaterProcessorService } from './docxtemplater-processor.service'
import { LibreOfficePdfConverterService } from './libreoffice-pdf-converter.service'
import { LocalStorageService } from './local-storage.service'
import { AzureBlobStorageService } from './azure-blob-storage.service'
import { PdfLibManipulatorService } from './pdf-lib-manipulator.service'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'ITemplateProcessorService',
      useClass: DocxtemplaterProcessorService,
    },
    {
      provide: 'IPdfConverterService',
      useClass: LibreOfficePdfConverterService,
    },
    {
      provide: 'IStorageService',
      useFactory: (configService: ConfigService) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'local')
        if (storageType === 'azure') {
          return new AzureBlobStorageService(configService)
        }
        return new LocalStorageService(configService)
      },
      inject: [ConfigService],
    },
    PdfLibManipulatorService,
  ],
  exports: ['ITemplateProcessorService', 'IPdfConverterService', 'IStorageService', PdfLibManipulatorService],
})
export class DocumentServicesModule {}
