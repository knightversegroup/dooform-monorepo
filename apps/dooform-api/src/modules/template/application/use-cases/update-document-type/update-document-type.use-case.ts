import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import { UpdateDocumentTypeDto } from '../../dtos/update-document-type.dto'

@Injectable()
@UseClassLogger('template')
export class UpdateDocumentTypeUseCase implements UseCase<UpdateDocumentTypeDto, any> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  @ValidateInput(UpdateDocumentTypeDto)
  async execute(dto: UpdateDocumentTypeDto): Promise<Result<any>> {
    const documentType = await this.documentTypeRepository.findById(dto.id)
    if (!documentType) {
      throw new EntityNotFoundException(`DocumentType with id ${dto.id} not found`)
    }

    if (dto.name !== undefined) documentType.updateName(dto.name)
    if (dto.nameEN !== undefined) documentType.updateNameEN(dto.nameEN ?? null)
    if (dto.description !== undefined) documentType.updateDescription(dto.description ?? null)
    if (dto.category !== undefined) documentType.updateCategory(dto.category ?? null)
    if (dto.icon !== undefined) documentType.updateIcon(dto.icon ?? null)
    if (dto.color !== undefined) documentType.updateColor(dto.color ?? null)
    if (dto.sortOrder !== undefined) documentType.updateSortOrder(dto.sortOrder)

    const saved = await this.documentTypeRepository.save(documentType)
    const props = saved.getProps()

    return {
      id: saved.id,
      code: props.code,
      name: props.name,
      nameEN: props.nameEN,
      description: props.description,
      category: props.category,
      icon: props.icon,
      color: props.color,
      sortOrder: props.sortOrder,
      updatedAt: props.updatedAt!,
    } as any
  }
}
