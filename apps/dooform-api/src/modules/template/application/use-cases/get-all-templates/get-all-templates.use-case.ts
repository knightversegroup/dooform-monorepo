import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result, SearchOptions, FilterCondition } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import { TemplateTier } from '../../../domain/enums/template.enum'
import type { TemplateProps } from '../../../domain/entities/template.entity'
import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetAllTemplatesDto } from '../../dtos/get-all-templates.dto'

const TIER_HIERARCHY: Record<string, string[]> = {
  [TemplateTier.FREE]: [TemplateTier.FREE],
  [TemplateTier.BASIC]: [TemplateTier.FREE, TemplateTier.BASIC],
  [TemplateTier.PRO]: [TemplateTier.FREE, TemplateTier.BASIC, TemplateTier.PRO],
  [TemplateTier.PREMIUM]: [TemplateTier.FREE, TemplateTier.BASIC, TemplateTier.PRO, TemplateTier.PREMIUM],
  [TemplateTier.ENTERPRISE]: [TemplateTier.FREE, TemplateTier.BASIC, TemplateTier.PRO, TemplateTier.PREMIUM, TemplateTier.ENTERPRISE],
}

interface TemplateListItem {
  id: string
  name: string
  displayName?: string | null
  description?: string | null
  author?: string | null
  status: string
  type: string
  tier: string
  category?: string | null
  filePath?: string | null
  originalFilename?: string | null
  documentTypeId?: string | null
  createdAt: Date
}

interface GetAllTemplatesResult {
  data: TemplateListItem[]
  total: number
  page: number
  pageSize: number
}

@Injectable()
@UseClassLogger('template')
export class GetAllTemplatesUseCase implements UseCase<GetAllTemplatesDto, GetAllTemplatesResult> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository
  ) {}

  @UseResult()
  async execute(dto: GetAllTemplatesDto, userTier?: string): Promise<Result<GetAllTemplatesResult>> {
    // Grouped query: return templates grouped by document type
    if (dto.grouped) {
      return this.executeGrouped(dto, userTier)
    }

    const conditions: FilterCondition<TemplateProps>[] = []

    if (dto.status) conditions.push({ field: 'status', operator: 'eq', value: dto.status })
    if (dto.type) conditions.push({ field: 'type', operator: 'eq', value: dto.type })
    if (dto.tier) conditions.push({ field: 'tier', operator: 'eq', value: dto.tier })
    if (dto.category) conditions.push({ field: 'category', operator: 'eq', value: dto.category })
    if (dto.documentTypeId) conditions.push({ field: 'documentTypeId', operator: 'eq', value: dto.documentTypeId })

    // Tier-based access control
    if (userTier && !dto.tier) {
      const allowedTiers = TIER_HIERARCHY[userTier.toUpperCase()] ?? [TemplateTier.FREE]
      conditions.push({ field: 'tier', operator: 'in', value: allowedTiers })
    }

    const searchOptions: SearchOptions<TemplateProps> = {
      filter: {
        conditions: conditions.length > 0 ? conditions : undefined,
        searchText: dto.search ? { fields: ['name', 'displayName', 'description'], value: dto.search } : undefined,
      },
      paging: {
        currentPage: dto.page ?? 0,
        pageSize: dto.pageSize ?? 20,
      },
      order: { field: 'createdAt', type: 'DESC' },
    }

    const result = await this.templateRepository.findWithSearchOptions(searchOptions)

    const items: TemplateListItem[] = result.data.map((template) => {
      const props = template.getProps()
      return {
        id: template.id,
        name: props.name,
        displayName: props.displayName,
        description: props.description,
        author: props.author,
        status: props.status,
        type: props.type,
        tier: props.tier,
        category: props.category,
        filePath: props.filePath,
        originalFilename: props.originalFilename,
        documentTypeId: props.documentTypeId,
        createdAt: props.createdAt!,
      }
    })

    return {
      data: items,
      total: result.total,
      page: result.page,
      pageSize: dto.pageSize ?? 20,
    } as any
  }

  private async executeGrouped(_dto: GetAllTemplatesDto, userTier?: string): Promise<Result<any>> {
    const allTemplates = await this.templateRepository.findAll()

    // Filter by tier access
    let filtered = allTemplates
    if (userTier) {
      const allowedTiers = TIER_HIERARCHY[userTier.toUpperCase()] ?? [TemplateTier.FREE]
      filtered = allTemplates.filter((t) => allowedTiers.includes(t.tier))
    }

    // Group by documentTypeId
    const grouped: Record<string, TemplateListItem[]> = {}
    const ungrouped: TemplateListItem[] = []

    for (const template of filtered) {
      const props = template.getProps()
      const item: TemplateListItem = {
        id: template.id,
        name: props.name,
        displayName: props.displayName,
        description: props.description,
        author: props.author,
        status: props.status,
        type: props.type,
        tier: props.tier,
        category: props.category,
        filePath: props.filePath,
        originalFilename: props.originalFilename,
        documentTypeId: props.documentTypeId,
        createdAt: props.createdAt!,
      }

      if (props.documentTypeId) {
        if (!grouped[props.documentTypeId]) grouped[props.documentTypeId] = []
        grouped[props.documentTypeId].push(item)
      } else {
        ungrouped.push(item)
      }
    }

    return {
      grouped,
      ungrouped,
      total: filtered.length,
    } as any
  }
}
