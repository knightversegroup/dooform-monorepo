import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository'
import {
  toTemplateResponse,
  toDocumentTypeResponse,
  type TemplateResponse,
  type DocumentTypeResponse,
} from '../../mappers/template.mapper'

interface GroupedTemplatesResult {
  documentTypes: (DocumentTypeResponse & { templates: TemplateResponse[] })[]
  orphanTemplates: TemplateResponse[]
}

@Injectable()
@UseClassLogger('template')
export class GetGroupedTemplatesUseCase implements UseCase<Record<string, never>, GroupedTemplatesResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
  ) {}

  @UseResult()
  async execute(_dto?: Record<string, never>): Promise<Result<GroupedTemplatesResult>> {
    // Get all document types
    const docTypes = await this.documentTypeRepository.findAll()

    // Get all templates grouped by document type
    const groups = await this.templateRepository.findGroupedByDocumentType()

    // Build grouped response
    const documentTypes = docTypes.map((dt) => {
      const group = groups.find((g) => g.documentTypeId === dt.id)
      return {
        ...toDocumentTypeResponse(dt),
        templates: (group?.templates ?? []).map(toTemplateResponse),
      }
    })

    // Get orphan templates
    const orphanTemplates = await this.templateRepository.findOrphanTemplates()

    return {
      document_types: documentTypes,
      orphan_templates: orphanTemplates.map(toTemplateResponse),
    } as any
  }
}
