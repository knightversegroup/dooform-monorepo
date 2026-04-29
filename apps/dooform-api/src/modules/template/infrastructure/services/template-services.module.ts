import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DocxPlaceholderExtractorService } from './docx-placeholder-extractor.service'
import { FieldDefinitionGeneratorService } from './field-definition-generator.service'
import { TemplatePreviewService } from './template-preview.service'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IPlaceholderExtractorService',
      useClass: DocxPlaceholderExtractorService,
    },
    {
      provide: 'IFieldDefinitionGeneratorService',
      useClass: FieldDefinitionGeneratorService,
    },
    {
      provide: 'ITemplatePreviewService',
      useClass: TemplatePreviewService,
    },
  ],
  exports: ['IPlaceholderExtractorService', 'IFieldDefinitionGeneratorService', 'ITemplatePreviewService'],
})
export class TemplateServicesModule {}
