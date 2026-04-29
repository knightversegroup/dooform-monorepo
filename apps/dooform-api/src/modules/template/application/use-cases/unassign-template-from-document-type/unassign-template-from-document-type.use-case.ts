import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { UnassignTemplateFromDocumentTypeDto } from '../../dtos/unassign-template-from-document-type.dto'

@Injectable()
@UseClassLogger('template')
export class UnassignTemplateFromDocumentTypeUseCase implements UseCase<UnassignTemplateFromDocumentTypeDto, { success: boolean }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(UnassignTemplateFromDocumentTypeDto)
  async execute(dto: UnassignTemplateFromDocumentTypeDto): Promise<Result<{ success: boolean }>> {
    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    template.setDocumentTypeId(null)

    await this.templateRepository.save(template)

    return { success: true } as any
  }
}
