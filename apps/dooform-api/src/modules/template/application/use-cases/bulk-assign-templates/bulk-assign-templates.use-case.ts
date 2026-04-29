import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { BulkAssignTemplatesDto } from '../../dtos/bulk-assign-templates.dto'

@Injectable()
@UseClassLogger('template')
export class BulkAssignTemplatesUseCase implements UseCase<BulkAssignTemplatesDto, { success: boolean; assigned: number }> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(BulkAssignTemplatesDto)
  async execute(dto: BulkAssignTemplatesDto): Promise<Result<{ success: boolean; assigned: number }>> {
    const documentType = await this.documentTypeRepository.findById(dto.documentTypeId)
    if (!documentType) {
      throw new EntityNotFoundException(`DocumentType with id ${dto.documentTypeId} not found`)
    }

    for (const assignment of dto.assignments) {
      const template = await this.templateRepository.findById(assignment.templateId)
      if (!template) {
        throw new EntityNotFoundException(`Template with id ${assignment.templateId} not found`)
      }

      template.setDocumentTypeId(dto.documentTypeId)
      if (assignment.variantName !== undefined || assignment.variantOrder !== undefined) {
        template.setVariant(assignment.variantName ?? '', assignment.variantOrder ?? 0)
      }

      await this.templateRepository.save(template)
    }

    return { success: true, assigned: dto.assignments.length } as any
  }
}
