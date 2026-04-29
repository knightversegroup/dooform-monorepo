import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

interface TemplateListItem {
  id: string
  name: string
  displayName?: string | null
  description?: string | null
  status: string
  type: string
  tier: string
  category?: string | null
  createdAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetTemplatesByDocumentTypeUseCase implements UseCase<GetTemplateByIdDto, TemplateListItem[]> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<TemplateListItem[]>> {
    const templates = await this.templateRepository.findByDocumentTypeId(dto.id)

    const items: TemplateListItem[] = templates.map((template) => {
      const props = template.getProps()
      return {
        id: template.id,
        name: props.name,
        displayName: props.displayName,
        description: props.description,
        status: props.status,
        type: props.type,
        tier: props.tier,
        category: props.category,
        createdAt: props.createdAt!,
      }
    })

    return items as any
  }
}
