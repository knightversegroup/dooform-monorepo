import { Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import {
  TyphoonService,
  type FieldTypeSuggestionResult,
  type DataTypeInfo,
} from '../../services/typhoon.service'
import { SuggestFieldTypesDto } from '../../dtos/suggest-field-types.dto'

interface SuggestFieldTypesResult extends FieldTypeSuggestionResult {
  message: string
}

@Injectable()
@UseClassLogger('ai')
export class SuggestFieldTypesUseCase
  implements UseCase<SuggestFieldTypesDto, SuggestFieldTypesResult>
{
  constructor(private readonly typhoonService: TyphoonService) {}

  @UseResult()
  @ValidateInput(SuggestFieldTypesDto)
  async execute(dto: SuggestFieldTypesDto): Promise<Result<SuggestFieldTypesResult>> {
    let result: FieldTypeSuggestionResult

    if (dto.html_content) {
      const contexts = this.typhoonService.extractPlaceholdersWithContext(dto.html_content, 100)
      const placeholders = contexts.map((ctx) => ctx.placeholder)

      if (dto.data_types && dto.data_types.length > 0) {
        result = await this.typhoonService.suggestFieldTypesWithDataTypes(
          placeholders,
          contexts,
          dto.data_types as DataTypeInfo[],
        )
      } else {
        result = await this.typhoonService.suggestFieldTypes(placeholders, contexts)
      }
    } else if (dto.placeholders && dto.placeholders.length > 0) {
      if (dto.data_types && dto.data_types.length > 0) {
        result = await this.typhoonService.suggestFieldTypesWithDataTypes(
          dto.placeholders,
          null,
          dto.data_types as DataTypeInfo[],
        )
      } else {
        result = await this.typhoonService.suggestFieldTypesFromPlaceholders(dto.placeholders)
      }
    } else {
      throw new Error('Either html_content or placeholders is required')
    }

    return {
      suggestions: result.suggestions,
      model: result.model,
      provider: result.provider,
      message: `Generated ${result.suggestions.length} field type suggestions`,
    } as any
  }
}
