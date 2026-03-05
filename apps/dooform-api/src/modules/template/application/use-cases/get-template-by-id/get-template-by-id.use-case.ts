import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

interface GetTemplateByIdResult {
  id: string
  name: string
  description?: string | null
  status: string
  type: string
  tier: string
  createdAt: Date
  updatedAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetTemplateByIdUseCase implements UseCase<GetTemplateByIdDto, GetTemplateByIdResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<GetTemplateByIdResult>> {
    const template = await this.templateRepository.findById(dto.id)

    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    const props = template.getProps()

    return {
      id: template.id,
      name: props.name,
      description: props.description,
      status: props.status,
      type: props.type,
      tier: props.tier,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
