import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetAllTemplatesDto } from '../../dtos/get-all-templates.dto'

interface TemplateListItem {
  id: string
  name: string
  description?: string | null
  status: string
  type: string
  tier: string
  createdAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetAllTemplatesUseCase implements UseCase<GetAllTemplatesDto, TemplateListItem[]> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(_dto: GetAllTemplatesDto): Promise<Result<TemplateListItem[]>> {
    const templates = await this.templateRepository.findAll()

    return templates.map((template) => {
      const props = template.getProps()
      return {
        id: template.id,
        name: props.name,
        description: props.description,
        status: props.status,
        type: props.type,
        tier: props.tier,
        createdAt: props.createdAt!,
      }
    }) as any
  }
}
