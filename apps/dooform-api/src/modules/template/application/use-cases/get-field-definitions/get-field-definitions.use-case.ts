import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { FieldDefinition } from '../../../domain/entities/field-definition.interface'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class GetFieldDefinitionsUseCase implements UseCase<GetTemplateByIdDto, { fieldDefinitions: FieldDefinition[] }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ fieldDefinitions: FieldDefinition[] }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    return { fieldDefinitions: template.fieldDefinitions ?? [] } as any
  }
}
