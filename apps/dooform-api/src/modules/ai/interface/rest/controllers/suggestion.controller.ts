import { Controller, Post, Param, Body, UseFilters, Logger } from '@nestjs/common'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { SuggestAliasesUseCase } from '../../../application/use-cases/suggest-aliases/suggest-aliases.use-case'
import type { SuggestAliasesDto } from '../../../application/dtos/suggest-aliases.dto'

@Controller('templates')
@UseFilters(HttpResultExceptionFilter)
export class SuggestionController {
  private readonly logger = new Logger(SuggestionController.name)

  constructor(private readonly suggestAliasesUseCase: SuggestAliasesUseCase) {}

  @Post(':id/suggest-aliases')
  async suggestAliases(@Param('id') _id: string, @Body() body: SuggestAliasesDto) {
    this.logger.log(`Received suggest-aliases request: ${JSON.stringify(body)}`)
    try {
      const result = await this.suggestAliasesUseCase.execute(body)
      this.logger.log(`Suggest-aliases result: ${JSON.stringify(result)}`)
      return getResultValue(result)
    } catch (error) {
      this.logger.error(`Suggest-aliases error: ${error}`)
      throw error
    }
  }
}
