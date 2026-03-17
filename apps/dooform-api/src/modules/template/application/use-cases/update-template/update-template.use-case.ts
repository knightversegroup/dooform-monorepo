import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { TemplateType, TemplateTier, TemplateCategory } from '../../../domain/enums/template.enum'
import { toTemplateResponse, type TemplateResponse } from '../../mappers/template.mapper'

interface UpdateTemplateInput {
  id: string
  displayName?: string
  name?: string
  description?: string
  author?: string
  category?: string
  originalSource?: string
  remarks?: string
  isVerified?: boolean
  isAIAvailable?: boolean
  type?: string
  tier?: string
  group?: string
  aliases?: Record<string, string>
}

@Injectable()
@UseClassLogger('template')
export class UpdateTemplateUseCase implements UseCase<UpdateTemplateInput, TemplateResponse> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(dto: UpdateTemplateInput): Promise<Result<TemplateResponse>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    // Match Go logic: always set displayName, description, author
    if (dto.displayName !== undefined) template.updateDisplayName(dto.displayName)
    if (dto.description !== undefined) template.updateDescription(dto.description)
    if (dto.author !== undefined) this.updateProp(template, 'author', dto.author)

    // Only set if non-empty (matching Go logic)
    if (dto.name) template.updateName(dto.name)
    if (dto.category) this.updateProp(template, 'category', dto.category as TemplateCategory)
    if (dto.originalSource) this.updateProp(template, 'originalSource', dto.originalSource)
    if (dto.remarks) this.updateProp(template, 'remarks', dto.remarks)
    if (dto.isVerified !== undefined) this.updateProp(template, 'isVerified', dto.isVerified)
    if (dto.isAIAvailable !== undefined) this.updateProp(template, 'isAIAvailable', dto.isAIAvailable)
    if (dto.type) this.updateProp(template, 'type', dto.type as TemplateType)
    if (dto.tier) this.updateProp(template, 'tier', dto.tier as TemplateTier)
    if (dto.group) this.updateProp(template, 'group', dto.group)

    if (dto.aliases) {
      template.updateFieldDefinitions(template.fieldDefinitions)
      this.updateProp(template, 'aliases', JSON.stringify(dto.aliases))
    }

    const saved = await this.templateRepository.save(template)

    return {
      message: 'Template updated successfully',
      template: toTemplateResponse(saved),
    } as any
  }

  private updateProp(template: any, key: string, value: any): void {
    // Use internal prop manager to update arbitrary props
    const props = template.getProps()
    template._props = { ...props, [key]: value }
  }
}
