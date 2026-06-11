import { Module } from '@nestjs/common'

import { SuggestAliasesUseCaseModule } from '../application/use-cases/suggest-aliases/suggest-aliases.use-case.module'
import { SuggestionController } from './rest/controllers/suggestion.controller'

@Module({
  imports: [SuggestAliasesUseCaseModule],
  controllers: [SuggestionController],
})
export class AiInterfaceModule {}
