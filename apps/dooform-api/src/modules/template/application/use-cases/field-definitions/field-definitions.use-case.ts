import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { DocxProcessorService } from '../../services/docx-processor.service'
import { generateFieldDefinitions, type FieldDefinition } from '../../services/field-type-detector'
import { toTemplateResponse, type TemplateResponse } from '../../mappers/template.mapper'

interface GetFieldDefinitionsInput {
  id: string
}

interface UpdateFieldDefinitionsInput {
  id: string
  fieldDefinitions: Record<string, FieldDefinition>
}

interface RegenerateFieldDefinitionsInput {
  id: string
}

@Injectable()
@UseClassLogger('template')
export class GetFieldDefinitionsUseCase implements UseCase<GetFieldDefinitionsInput, Record<string, any>> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(dto: GetFieldDefinitionsInput): Promise<Result<Record<string, any>>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    return template.getParsedFieldDefinitions() as any
  }
}

@Injectable()
@UseClassLogger('template')
export class UpdateFieldDefinitionsUseCase implements UseCase<UpdateFieldDefinitionsInput, { message: string; template: TemplateResponse }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(dto: UpdateFieldDefinitionsInput): Promise<Result<{ message: string; template: TemplateResponse }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    template.updateFieldDefinitions(JSON.stringify(dto.fieldDefinitions))
    const saved = await this.templateRepository.save(template)

    return {
      message: 'Field definitions updated successfully',
      template: toTemplateResponse(saved),
    } as any
  }
}

@Injectable()
@UseClassLogger('template')
export class RegenerateFieldDefinitionsUseCase implements UseCase<RegenerateFieldDefinitionsInput, { message: string; fieldDefinitions: Record<string, FieldDefinition> }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly docxProcessor: DocxProcessorService,
  ) {}

  @UseResult()
  async execute(dto: RegenerateFieldDefinitionsInput): Promise<Result<{ message: string; fieldDefinitions: Record<string, FieldDefinition> }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    // Parse existing placeholders
    let placeholders = template.getParsedPlaceholders()

    // If no stored placeholders, they need to be re-extracted
    // (In a full implementation, this would download the DOCX from storage)
    if (placeholders.length === 0) {
      placeholders = []
    }

    // Generate field definitions from placeholders
    const fieldDefinitions = generateFieldDefinitions(placeholders)

    template.updateFieldDefinitions(JSON.stringify(fieldDefinitions))

    // Also update placeholders if they were re-extracted
    if (placeholders.length > 0) {
      template.updatePlaceholders(JSON.stringify(placeholders))
    }

    await this.templateRepository.save(template)

    return {
      message: 'Field definitions regenerated successfully',
      fieldDefinitions,
    } as any
  }
}
