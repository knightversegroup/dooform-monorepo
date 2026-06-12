import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { ToggleTemplateFavoriteUseCase } from './toggle-template-favorite.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [ToggleTemplateFavoriteUseCase],
  exports: [ToggleTemplateFavoriteUseCase],
})
export class ToggleTemplateFavoriteUseCaseModule {}
