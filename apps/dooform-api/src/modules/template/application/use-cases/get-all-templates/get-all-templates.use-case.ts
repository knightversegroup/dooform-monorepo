import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository, TemplateFilter } from '../../../domain/repositories/template.repository'
import { toTemplateResponse, type TemplateResponse } from '../../mappers/template.mapper'

@Injectable()
@UseClassLogger('template')
export class GetAllTemplatesUseCase implements UseCase<TemplateFilter, TemplateResponse[]> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(filter: TemplateFilter): Promise<Result<TemplateResponse[]>> {
    const templates = await this.templateRepository.findWithFilter(filter)

    return templates.map((template) => toTemplateResponse(template)) as any
  }
}
