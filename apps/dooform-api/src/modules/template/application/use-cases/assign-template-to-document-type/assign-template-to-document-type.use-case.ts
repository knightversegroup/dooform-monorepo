import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { AssignTemplateToDocumentTypeDto } from '../../dtos/assign-template-to-document-type.dto'

@Injectable()
@UseClassLogger('template')
export class AssignTemplateToDocumentTypeUseCase implements UseCase<AssignTemplateToDocumentTypeDto, { success: boolean }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(AssignTemplateToDocumentTypeDto)
  async execute(dto: AssignTemplateToDocumentTypeDto): Promise<Result<{ success: boolean }>> {
    const documentType = await this.documentTypeRepository.findById(dto.documentTypeId)
    if (!documentType) {
      throw new EntityNotFoundException(`DocumentType with id ${dto.documentTypeId} not found`)
    }

    const template = await this.templateRepository.findById(dto.templateId)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.templateId} not found`)
    }

    template.setDocumentTypeId(dto.documentTypeId)
    if (dto.variantName !== undefined || dto.variantOrder !== undefined) {
      template.setVariant(dto.variantName ?? '', dto.variantOrder ?? 0)
    }

    await this.templateRepository.save(template)

    return { success: true } as any
  }
}
