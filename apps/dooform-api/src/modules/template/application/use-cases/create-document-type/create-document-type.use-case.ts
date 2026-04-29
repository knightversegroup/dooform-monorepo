import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { DocumentType } from '../../../domain/entities/document-type.entity'
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import { CreateDocumentTypeDto } from '../../dtos/create-document-type.dto'

interface CreateDocumentTypeResult {
  id: string
  code: string
  name: string
  nameEN?: string | null
  description?: string | null
  category?: string | null
  icon?: string | null
  color?: string | null
  sortOrder?: number
  createdAt: Date
}

@Injectable()
@UseClassLogger('template')
export class CreateDocumentTypeUseCase implements UseCase<CreateDocumentTypeDto, CreateDocumentTypeResult> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  @ValidateInput(CreateDocumentTypeDto)
  async execute(dto: CreateDocumentTypeDto): Promise<Result<CreateDocumentTypeResult>> {
    const documentType = DocumentType.create({
      code: dto.code,
      name: dto.name,
      nameEN: dto.nameEN,
      description: dto.description,
      category: dto.category,
      icon: dto.icon,
      color: dto.color,
      sortOrder: dto.sortOrder,
    })

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
      createdAt: props.createdAt!,
    } as any
  }
}
