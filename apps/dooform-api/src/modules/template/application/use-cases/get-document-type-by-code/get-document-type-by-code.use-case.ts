import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import { GetDocumentTypeByCodeDto } from '../../dtos/get-document-type-by-code.dto'

interface GetDocumentTypeByCodeResult {
  id: string
  code: string
  name: string
  nameEN?: string | null
  description?: string | null
  category?: string | null
  icon?: string | null
  color?: string | null
  sortOrder?: number
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetDocumentTypeByCodeUseCase implements UseCase<GetDocumentTypeByCodeDto, GetDocumentTypeByCodeResult> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetDocumentTypeByCodeDto)
  async execute(dto: GetDocumentTypeByCodeDto): Promise<Result<GetDocumentTypeByCodeResult>> {
    const documentType = await this.documentTypeRepository.findByCode(dto.code)

    if (!documentType) {
      throw new EntityNotFoundException(`DocumentType with code ${dto.code} not found`)
    }

    const props = documentType.getProps()

    return {
      id: documentType.id,
      code: props.code,
      name: props.name,
      nameEN: props.nameEN,
      description: props.description,
      category: props.category,
      icon: props.icon,
      color: props.color,
      sortOrder: props.sortOrder,
      isActive: props.isActive,
      createdAt: props.createdAt!,
      updatedAt: props.updatedAt!,
    } as any
  }
}
