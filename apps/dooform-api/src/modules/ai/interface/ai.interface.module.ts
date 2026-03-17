import { Module } from '@nestjs/common'

import { ExtractTextUseCaseModule } from '../application/use-cases/extract-text/extract-text.use-case.module'
import { SmartOcrUseCaseModule } from '../application/use-cases/smart-ocr/smart-ocr.use-case.module'
import { MapFieldsUseCaseModule } from '../application/use-cases/map-fields/map-fields.use-case.module'
import { SuggestAliasesUseCaseModule } from '../application/use-cases/suggest-aliases/suggest-aliases.use-case.module'
import { SuggestFieldTypesUseCaseModule } from '../application/use-cases/suggest-field-types/suggest-field-types.use-case.module'

import { OcrController, TemplateOcrController } from './rest/controllers/ocr.controller'
import { SuggestionController } from './rest/controllers/suggestion.controller'

@Module({
  imports: [
    ExtractTextUseCaseModule,
    SmartOcrUseCaseModule,
    MapFieldsUseCaseModule,
    SuggestAliasesUseCaseModule,
    SuggestFieldTypesUseCaseModule,
  ],
  controllers: [OcrController, TemplateOcrController, SuggestionController],
})
export class AiInterfaceModule {}
