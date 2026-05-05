import { ForbiddenException } from '@nestjs/common'
import { EntityNotFoundException } from '@dooform-api-core/domain'

import type { Template } from '../../domain/entities/template.entity'
import { TemplateStatus, TemplateVisibility } from '../../domain/enums/template.enum'

export interface TemplateAccessContext {
  callerRole?: string
  callerOrganizationId?: string | null
  callerUserId?: string
}

/**
 * Read scope: who can fetch a single template by id.
 *  - GLOBAL_ADMIN: always.
 *  - ORG_ADMIN of org X: any template where organizationId=X (any status), plus PUBLISHED GLOBAL.
 *  - USER: only PUBLISHED templates in own-org or GLOBAL.
 *  - Owner: always sees own work regardless of role.
 *
 * Returning a 404-style error keeps drafts invisible (no information leak about existence).
 */
export function assertCanReadTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const isGlobalAdmin = ctx.callerRole === 'GLOBAL_ADMIN'
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId
  const sameOrg = !!ctx.callerOrganizationId && ctx.callerOrganizationId === props.organizationId
  const isOrgAdminOfOwner = ctx.callerRole === 'ORG_ADMIN' && sameOrg
  const isPublished = props.status === TemplateStatus.PUBLISHED
  const isStrictGlobal = props.visibility === TemplateVisibility.GLOBAL
  // Authenticated callers may still see legacy null-org rows as if they were GLOBAL —
  // those entered the system before visibility was tracked. Anonymous (public) callers
  // do NOT get this fallback; only an explicit GLOBAL flag is enough.
  const isAnonymous = !ctx.callerRole && !ctx.callerUserId && !ctx.callerOrganizationId
  const isVisibleToAllOrgs = isStrictGlobal || (!isAnonymous && props.organizationId == null)

  if (isGlobalAdmin || isOwner || isOrgAdminOfOwner) return
  // Non-admins (including ORG_ADMIN of another org) only see PUBLISHED templates within scope.
  if (isPublished && (sameOrg || isVisibleToAllOrgs)) return

  throw new EntityNotFoundException(`Template with id ${template.id} not found`)
}

/**
 * Edit / delete scope: only the original uploader (owner) or a GLOBAL_ADMIN may
 * modify or delete a template. ORG_ADMINs of the same tenant can SEE the template
 * (read scope still allows that) but cannot edit or delete templates they did not
 * upload — they should ask the owner, or use archive/unpublish at the tenant level
 * (which currently still goes through this same edit gate, so it's owner-only too).
 *
 * This is intentionally strict: templates carry data and field definitions that the
 * owner curates, so accidental cross-user edits are dangerous.
 */
export function assertCanEditTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const isGlobalAdmin = ctx.callerRole === 'GLOBAL_ADMIN'
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId

  if (isGlobalAdmin || isOwner) return

  throw new ForbiddenException(
    'Only the template owner or a global admin can modify this template',
  )
}

/** Alias kept for the delete path — same rule, different message for clarity in logs. */
export function assertCanDeleteTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const isGlobalAdmin = ctx.callerRole === 'GLOBAL_ADMIN'
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId

  if (isGlobalAdmin || isOwner) return

  throw new ForbiddenException(
    'Only the template owner or a global admin can delete this template',
  )
}
