import { Controller, Post, Param, Body, UseFilters } from '@nestjs/common'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { SuggestAliasesUseCase } from '../../../application/use-cases/suggest-aliases/suggest-aliases.use-case'
import { SuggestFieldTypesUseCase } from '../../../application/use-cases/suggest-field-types/suggest-field-types.use-case'
import type { SuggestAliasesDto } from '../../../application/dtos/suggest-aliases.dto'
import type { SuggestFieldTypesDto } from '../../../application/dtos/suggest-field-types.dto'

@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class SuggestionController {
  constructor(
    private readonly suggestAliasesUseCase: SuggestAliasesUseCase,
    private readonly suggestFieldTypesUseCase: SuggestFieldTypesUseCase,
  ) {}

  @Post(':id/suggest-aliases')
  async suggestAliases(@Param('id') _id: string, @Body() body: SuggestAliasesDto) {
    const result = await this.suggestAliasesUseCase.execute(body)
    return getResultValue(result)
  }

  @Post(':id/suggest-field-types')
  async suggestFieldTypes(@Param('id') _id: string, @Body() body: SuggestFieldTypesDto) {
    const result = await this.suggestFieldTypesUseCase.execute(body)
    return getResultValue(result)
  }
}
