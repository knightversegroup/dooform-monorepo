import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { TierConfigService } from '../../../../user/application/services/tier-config.service'
import { GetAllTemplatesDto } from '../../dtos/get-all-templates.dto'

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
  visibility?: string | null
  organizationId?: string | null
  ownerUserId?: string | null
  filePath?: string | null
  originalFilename?: string | null
  documentTypeId?: string | null
  createdAt: Date
  updatedAt?: Date
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
    private readonly templateRepository: ITemplateRepository,
    private readonly tierConfig: TierConfigService,
  ) {}

  @UseResult()
  async execute(dto: GetAllTemplatesDto, userTier?: string): Promise<Result<GetAllTemplatesResult>> {
    const isAdmin = dto.callerRole === 'GLOBAL_ADMIN' || dto.callerRole === 'ORG_ADMIN'

    // Grouped query: return templates grouped by document type
    if (dto.grouped) {
      return this.executeGrouped(dto, userTier, isAdmin)
    }

    // Allowed tiers come from the unified TierConfig table — same source as the
    // /settings/tiers admin console and the org subscription tier. Lower-sortOrder
    // tiers fold into higher ones.
    const allowedTiers =
      userTier && !dto.tier
        ? await this.tierConfig.getAllowedTierCodesForUser(userTier)
        : undefined

    // Visibility scope is enforced inside the repository based on callerRole:
    // ORG_ADMIN sees own-org any-status + GLOBAL PUBLISHED; USER sees PUBLISHED only.
    const result = await this.templateRepository.findVisibleToOrg({
      organizationId: dto.organizationId ?? null,
      status: dto.status,
      type: dto.type,
      tier: dto.tier,
      tiers: allowedTiers,
      category: dto.category,
      search: dto.search,
      documentTypeId: dto.documentTypeId,
      page: dto.page ?? 0,
      pageSize: dto.pageSize ?? 20,
      callerRole: dto.callerRole,
      publicOnly: dto.publicOnly,
    })

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
        visibility: props.visibility,
        organizationId: props.organizationId,
        ownerUserId: props.ownerUserId,
        filePath: props.filePath,
        originalFilename: props.originalFilename,
        documentTypeId: props.documentTypeId,
        createdAt: props.createdAt!,
        updatedAt: props.updatedAt!,
      }
    })

    return {
      data: items,
      total: result.total,
      page: dto.page ?? 0,
      pageSize: dto.pageSize ?? 20,
    } as any
  }

  private async executeGrouped(dto: GetAllTemplatesDto, userTier?: string, _isAdmin = false): Promise<Result<any>> {
    const allTemplates = await this.templateRepository.findAll()

    // Filter by tier access using the unified TierConfig hierarchy.
    let filtered = allTemplates
    if (userTier) {
      const allowedTiers = await this.tierConfig.getAllowedTierCodesForUser(userTier)
      filtered = filtered.filter((t) => allowedTiers.includes(t.tier))
    }

    // Apply the same visibility/status rules as the flat list:
    //  - GLOBAL_ADMIN: no further filter.
    //  - ORG_ADMIN of org X: own-org any-status + (GLOBAL or legacy) PUBLISHED.
    //  - USER: PUBLISHED only (own-org or GLOBAL/legacy).
    const callerRole = dto.callerRole
    const orgId = dto.organizationId ?? null
    if (callerRole !== 'GLOBAL_ADMIN') {
      filtered = filtered.filter((t) => {
        const p = t.getProps()
        const sameOrg = !!orgId && p.organizationId === orgId
        const isGlobalOrLegacy = p.visibility === 'GLOBAL' || p.organizationId == null
        const isPublished = p.status === 'PUBLISHED'
        if (callerRole === 'ORG_ADMIN') {
          return sameOrg || (isGlobalOrLegacy && isPublished)
        }
        return (sameOrg || isGlobalOrLegacy) && isPublished
      })
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
