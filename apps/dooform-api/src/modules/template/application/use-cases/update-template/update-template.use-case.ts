import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { UpdateTemplateDto } from '../../dtos/update-template.dto'

@Injectable()
@UseClassLogger('template')
export class UpdateTemplateUseCase implements UseCase<UpdateTemplateDto, any> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateTemplateDto)
  async execute(dto: UpdateTemplateDto): Promise<Result<any>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    if (dto.name !== undefined) template.updateName(dto.name)
    if (dto.displayName !== undefined) template.updateDisplayName(dto.displayName)
    if (dto.description !== undefined) template.updateDescription(dto.description ?? null)
    if (dto.author !== undefined) template.updateAuthor(dto.author ?? null)
    if (dto.type !== undefined) template.updateType(dto.type)
    if (dto.tier !== undefined) template.updateTier(dto.tier)
    if (dto.category !== undefined) template.updateCategory(dto.category ?? null)
    if (dto.pageOrientation !== undefined) template.updatePageOrientation(dto.pageOrientation ?? null)
    if (dto.remarks !== undefined) template.updateRemarks(dto.remarks ?? null)
    if (dto.group !== undefined) template.updateGroup(dto.group ?? null)
    if (dto.isAIAvailable !== undefined) template.updateIsAIAvailable(dto.isAIAvailable)

    const saved = await this.templateRepository.save(template)
    const props = saved.getProps()

    return {
      id: saved.id,
      name: props.name,
      displayName: props.displayName,
      description: props.description,
      author: props.author,
      status: props.status,
      type: props.type,
      tier: props.tier,
      category: props.category,
      updatedAt: props.updatedAt!,
    } as any
  }
}
