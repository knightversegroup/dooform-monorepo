import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { FieldDefinition } from '../../../domain/entities/field-definition.interface'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'

interface UpdateFieldDefinitionsInput {
  id: string
  fieldDefinitions: FieldDefinition[]
}

@Injectable()
@UseClassLogger('template')
export class UpdateFieldDefinitionsUseCase implements UseCase<UpdateFieldDefinitionsInput, { fieldDefinitions: FieldDefinition[] }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  async execute(dto: UpdateFieldDefinitionsInput): Promise<Result<{ fieldDefinitions: FieldDefinition[] }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    template.setFieldDefinitions(dto.fieldDefinitions)
    const saved = await this.templateRepository.save(template)

    return { fieldDefinitions: saved.fieldDefinitions ?? [] } as any
  }
}
