import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

interface TemplateListItem {
  id: string
  name: string
  displayName?: string | null
  description?: string | null
  status: string
  type: string
  tier: string
  category?: string | null
  createdAt: Date
}

@Injectable()
@UseClassLogger('template')
export class GetTemplatesByDocumentTypeUseCase implements UseCase<GetTemplateByIdDto, TemplateListItem[]> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<TemplateListItem[]>> {
    const all = await this.templateRepository.findByDocumentTypeId(dto.id)

    // Apply the same per-row visibility / status rules used by the flat list:
    //  - GLOBAL_ADMIN: sees everything.
    //  - ORG_ADMIN of org X: own-org rows (any status) + (GLOBAL or legacy) PUBLISHED.
    //  - USER: PUBLISHED rows in own-org or (GLOBAL or legacy).
    const callerRole = dto.callerRole
    const orgId = dto.callerOrganizationId ?? null
    const templates =
      callerRole === 'GLOBAL_ADMIN'
        ? all
        : all.filter((t) => {
            const p = t.getProps()
            const sameOrg = !!orgId && p.organizationId === orgId
            const isGlobalOrLegacy = p.visibility === 'GLOBAL' || p.organizationId == null
            const isPublished = p.status === 'PUBLISHED'
            if (callerRole === 'ORG_ADMIN') return sameOrg || (isGlobalOrLegacy && isPublished)
            return (sameOrg || isGlobalOrLegacy) && isPublished
          })

    const items: TemplateListItem[] = templates.map((template) => {
      const props = template.getProps()
      return {
        id: template.id,
        name: props.name,
        displayName: props.displayName,
        description: props.description,
        status: props.status,
        type: props.type,
        tier: props.tier,
        category: props.category,
        createdAt: props.createdAt!,
      }
    })

    return items as any
  }
}
