import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { assertCanEditTemplate } from '../../policies/template-access.policy'
import { UpdateTemplateDto } from '../../dtos/update-template.dto'
import { PermissionService } from '../../../../auth/application/services/permission.service'
import { UserRole } from '../../../../user/domain/enums/user.enum'

@Injectable()
@UseClassLogger('template')
export class UpdateTemplateUseCase implements UseCase<UpdateTemplateDto, any> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly permissions: PermissionService,
  ) {}

  @UseResult()
  @ValidateInput(UpdateTemplateDto)
  async execute(dto: UpdateTemplateDto): Promise<Result<any>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    const principal = { userId: dto.callerUserId, role: dto.callerRole as UserRole }
    const canEditAny = this.permissions.userHas(principal, 'templates:edit-any')
    const canPublishGlobal = this.permissions.userHas(principal, 'templates:publish-global')

    assertCanEditTemplate(template, {
      callerRole: dto.callerRole,
      callerOrganizationId: dto.callerOrganizationId,
      callerUserId: dto.callerUserId,
      canEditAny,
    })

    if (dto.name !== undefined) template.updateName(dto.name)
    if (dto.displayName !== undefined) template.updateDisplayName(dto.displayName)
    if (dto.description !== undefined) template.updateDescription(dto.description ?? null)
    if (dto.author !== undefined) template.updateAuthor(dto.author ?? null)
    // type / tier / category are runtime-configurable code references — typed as
    // plain strings here, but the entity setters still want the legacy enum types.
    // Casting through `unknown` keeps strict typescript happy without changing the
    // domain interface; the column accepts varchar so any string lands cleanly.
    if (dto.type !== undefined) template.updateType(dto.type as unknown as never)
    if (dto.tier !== undefined && canPublishGlobal) {
      template.updateTier(String(dto.tier).toLowerCase() as unknown as never)
    }
    // Visibility flips also rebind the organization. GLOBAL templates have
    // organizationId=null and live in the platform `global/...` storage prefix;
    // ORGANIZATION templates must have an organizationId or they're invisible to
    // every tenant. When an admin demotes GLOBAL → ORGANIZATION we attach the
    // template to the caller's org so it shows up immediately under that tenant.
    if (dto.visibility !== undefined && canPublishGlobal) {
      template.updateVisibility(dto.visibility)
      if (dto.visibility === 'GLOBAL') {
        template.updateOrganizationId(null)
      } else if (dto.visibility === 'ORGANIZATION' && dto.callerOrganizationId) {
        template.updateOrganizationId(dto.callerOrganizationId)
      }
    }
    if (dto.category !== undefined)
      template.updateCategory((dto.category ?? null) as unknown as never)
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
