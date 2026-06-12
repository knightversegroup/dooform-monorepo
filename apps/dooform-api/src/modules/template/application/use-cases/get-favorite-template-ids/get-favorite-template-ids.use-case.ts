import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateFavoriteRepository } from '../../../domain/repositories/template-favorite.repository'

export interface GetFavoriteTemplateIdsDto {
  userId: string
}

export interface GetFavoriteTemplateIdsResult {
  templateIds: string[]
}

@Injectable()
@UseClassLogger('template')
export class GetFavoriteTemplateIdsUseCase
  implements UseCase<GetFavoriteTemplateIdsDto, GetFavoriteTemplateIdsResult>
{
  constructor(
    @Inject('ITemplateFavoriteRepository')
    private readonly favoriteRepository: ITemplateFavoriteRepository,
  ) {}

  @UseResult()
  async execute(dto: GetFavoriteTemplateIdsDto): Promise<Result<GetFavoriteTemplateIdsResult>> {
    const templateIds = await this.favoriteRepository.getFavoriteTemplateIds(dto.userId)
    return { templateIds } as any
  }
}
