import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'

interface GetDocumentTypeCategoriesResult {
  categories: string[]
}

@Injectable()
@UseClassLogger('template')
export class GetDocumentTypeCategoriesUseCase implements UseCase<Record<string, never>, GetDocumentTypeCategoriesResult> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<GetDocumentTypeCategoriesResult>> {
    const categories = await this.documentTypeRepository.findDistinctCategories()

    return { categories } as any
  }
}
