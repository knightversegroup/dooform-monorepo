import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateFavoriteRepository } from '../../../domain/repositories/template-favorite.repository'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'

export interface ToggleTemplateFavoriteDto {
  templateId: string
  userId: string
  action: 'add' | 'remove'
}

export interface ToggleTemplateFavoriteResult {
  templateId: string
  isFavorite: boolean
}

@Injectable()
@UseClassLogger('template')
export class ToggleTemplateFavoriteUseCase
  implements UseCase<ToggleTemplateFavoriteDto, ToggleTemplateFavoriteResult>
{
  constructor(
    @Inject('ITemplateFavoriteRepository')
    private readonly favoriteRepository: ITemplateFavoriteRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: ToggleTemplateFavoriteDto): Promise<Result<ToggleTemplateFavoriteResult>> {
    // Verify template exists before favoriting (prevents favoriting invalid/hidden templates)
    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    if (dto.action === 'add') {
      await this.favoriteRepository.addFavorite(dto.userId, dto.templateId)
      return { templateId: dto.templateId, isFavorite: true } as any
    } else {
      await this.favoriteRepository.removeFavorite(dto.userId, dto.templateId)
      return { templateId: dto.templateId, isFavorite: false } as any
    }
  }
}
