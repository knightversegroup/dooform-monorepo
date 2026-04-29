import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'

interface DocumentTypeListItem {
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
}

@Injectable()
@UseClassLogger('template')
export class GetAllDocumentTypesUseCase implements UseCase<Record<string, never>, DocumentTypeListItem[]> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<DocumentTypeListItem[]>> {
    const documentTypes = await this.documentTypeRepository.findAll()

    const items: DocumentTypeListItem[] = documentTypes.map((dt) => {
      const props = dt.getProps()
      return {
        id: dt.id,
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
      }
    })

    return items as any
  }
}
