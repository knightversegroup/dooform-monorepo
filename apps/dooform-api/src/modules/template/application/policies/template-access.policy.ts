import { ForbiddenException } from '@nestjs/common'
import { EntityNotFoundException } from '@dooform-api-core/domain'

import type { Template } from '../../domain/entities/template.entity'
import { TemplateStatus, TemplateVisibility } from '../../domain/enums/template.enum'

export interface TemplateAccessContext {
  callerRole?: string
  callerOrganizationId?: string | null
  callerUserId?: string
  // Pre-computed permission booleans supplied by the calling controller/use-case
  // (which has access to PermissionService via DI). Keeps this policy helper a pure
  // function and avoids dragging the auth module into every callsite.
  //
  // `canReadCrossOrg`: holder of `templates:read-cross-org`. Used to scope draft/
  // archived reads. Falls back to `callerRole === 'GLOBAL_ADMIN'` for callers that
  // haven't migrated yet — that fallback should be removed once every callsite
  // passes the boolean.
  canReadCrossOrg?: boolean
  // `canEditAny`: holder of `templates:edit-any`. Owners bypass this regardless.
  canEditAny?: boolean
}

function effectiveCanReadCrossOrg(ctx: TemplateAccessContext): boolean {
  if (typeof ctx.canReadCrossOrg === 'boolean') return ctx.canReadCrossOrg
  return ctx.callerRole === 'GLOBAL_ADMIN'
}

function effectiveCanEditAny(ctx: TemplateAccessContext): boolean {
  if (typeof ctx.canEditAny === 'boolean') return ctx.canEditAny
  return ctx.callerRole === 'GLOBAL_ADMIN'
}

/**
 * Read scope: who can fetch a single template by id.
 *  - templates:read-cross-org: always (replaces the old GLOBAL_ADMIN bypass).
 *  - ORG_ADMIN of org X: any template where organizationId=X (any status), plus PUBLISHED GLOBAL.
 *  - USER: only PUBLISHED templates in own-org or GLOBAL.
 *  - Owner: always sees own work regardless of role.
 *
 * Returning a 404-style error keeps drafts invisible (no information leak about existence).
 */
export function assertCanReadTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const canReadCrossOrg = effectiveCanReadCrossOrg(ctx)
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

  if (canReadCrossOrg || isOwner || isOrgAdminOfOwner) return
  // Non-admins (including ORG_ADMIN of another org) only see PUBLISHED templates within scope.
  if (isPublished && (sameOrg || isVisibleToAllOrgs)) return

  throw new EntityNotFoundException(`Template with id ${template.id} not found`)
}

/**
 * Edit / delete scope: the owner or anyone holding `templates:edit-any`. ORG_ADMINs of
 * the same tenant can SEE the template (read scope still allows that) but cannot edit
 * or delete templates they did not upload — they should ask the owner, or hold the
 * `templates:edit-any` permission explicitly.
 *
 * This is intentionally strict: templates carry data and field definitions that the
 * owner curates, so accidental cross-user edits are dangerous.
 */
export function assertCanEditTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const canEditAny = effectiveCanEditAny(ctx)
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId

  if (canEditAny || isOwner) return

  throw new ForbiddenException(
    'Only the template owner or a user with edit-any permission can modify this template',
  )
}

/** Alias kept for the delete path — same rule, different message for clarity in logs. */
export function assertCanDeleteTemplate(template: Template, ctx: TemplateAccessContext): void {
  const props = template.getProps()
  const canEditAny = effectiveCanEditAny(ctx)
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId

  if (canEditAny || isOwner) return

  throw new ForbiddenException(
    'Only the template owner or a user with edit-any permission can delete this template',
  )
}

// Convenience wrappers that compute `canEditAny` / `canReadCrossOrg` from a principal
// using the permission service, so each use case can call one function instead of
// repeating the boolean-derivation logic. Accepts a minimal { userHas } interface
// rather than the concrete service to keep this policy file free of cross-module
// type imports.
type PermissionLookup = {
  userHas: (
    principal: { userId?: string; role: string } | null | undefined,
    key: string,
  ) => boolean
}

interface PrincipalCtx {
  callerUserId?: string
  callerRole?: string
  callerOrganizationId?: string | null
}

export function assertCanEditTemplateByPrincipal(
  template: Template,
  dto: PrincipalCtx,
  permissions: PermissionLookup,
): void {
  const canEditAny = permissions.userHas(
    { userId: dto.callerUserId, role: dto.callerRole ?? '' },
    'templates:edit-any',
  )
  assertCanEditTemplate(template, { ...dto, canEditAny })
}

export function assertCanDeleteTemplateByPrincipal(
  template: Template,
  dto: PrincipalCtx,
  permissions: PermissionLookup,
): void {
  const canEditAny = permissions.userHas(
    { userId: dto.callerUserId, role: dto.callerRole ?? '' },
    'templates:edit-any',
  )
  assertCanDeleteTemplate(template, { ...dto, canEditAny })
}

export function assertCanReadTemplateByPrincipal(
  template: Template,
  dto: PrincipalCtx,
  permissions: PermissionLookup,
): void {
  const canReadCrossOrg = permissions.userHas(
    { userId: dto.callerUserId, role: dto.callerRole ?? '' },
    'templates:read-cross-org',
  )
  assertCanReadTemplate(template, { ...dto, canReadCrossOrg })
}
