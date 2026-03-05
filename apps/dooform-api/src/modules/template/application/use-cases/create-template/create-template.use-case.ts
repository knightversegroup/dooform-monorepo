import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { Template } from '../../../domain/entities/template.entity'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { CreateTemplateDto } from '../../dtos/create-template.dto'

interface CreateTemplateResult {
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
export class CreateTemplateUseCase implements UseCase<CreateTemplateDto, CreateTemplateResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  @ValidateInput(CreateTemplateDto)
  async execute(dto: CreateTemplateDto): Promise<Result<CreateTemplateResult>> {
    const template = Template.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      tier: dto.tier,
    })

    const saved = await this.templateRepository.save(template)
    const props = saved.getProps()

    return {
      id: saved.id,
      name: props.name,
      description: props.description,
      status: props.status,
      type: props.type,
      tier: props.tier,
      createdAt: props.createdAt!,
    } as any
  }
}
