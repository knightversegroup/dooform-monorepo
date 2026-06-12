import { Module } from '@nestjs/common'

import { TemplateRepositoriesModule } from '../../../infrastructure/persistence/typeorm/template-repositories.module'

import { GetFavoriteTemplateIdsUseCase } from './get-favorite-template-ids.use-case'

@Module({
  imports: [TemplateRepositoriesModule],
  providers: [GetFavoriteTemplateIdsUseCase],
  exports: [GetFavoriteTemplateIdsUseCase],
})
export class GetFavoriteTemplateIdsUseCaseModule {}
