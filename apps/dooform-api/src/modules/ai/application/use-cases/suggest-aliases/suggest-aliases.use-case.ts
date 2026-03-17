import { Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { TyphoonService, type AliasSuggestionResult } from '../../services/typhoon.service'
import { SuggestAliasesDto } from '../../dtos/suggest-aliases.dto'

interface SuggestAliasesResult extends AliasSuggestionResult {
  message: string
}

@Injectable()
@UseClassLogger('ai')
export class SuggestAliasesUseCase implements UseCase<SuggestAliasesDto, SuggestAliasesResult> {
  constructor(private readonly typhoonService: TyphoonService) {}

  @UseResult()
  @ValidateInput(SuggestAliasesDto)
  async execute(dto: SuggestAliasesDto): Promise<Result<SuggestAliasesResult>> {
    let result: AliasSuggestionResult

    if (dto.html_content) {
      result = await this.typhoonService.suggestAliasesFromHTML(dto.html_content)
    } else if (dto.placeholders && dto.placeholders.length > 0) {
      result = await this.typhoonService.suggestAliasesFromPlaceholders(dto.placeholders)
    } else {
      throw new Error('Either html_content or placeholders is required')
    }

    return {
      suggestions: result.suggestions,
      model: result.model,
      provider: result.provider,
      message: `Generated ${result.suggestions.length} alias suggestions`,
    } as any
  }
}
