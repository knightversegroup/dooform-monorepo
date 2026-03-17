import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { toTemplateResponse, type TemplateResponse } from '../../mappers/template.mapper'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class GetTemplateByIdUseCase implements UseCase<GetTemplateByIdDto, TemplateResponse> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<TemplateResponse>> {
    const template = await this.templateRepository.findById(dto.id)

    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    return toTemplateResponse(template) as any
  }
}
