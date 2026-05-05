import { ForbiddenException } from '@nestjs/common'
import { EntityNotFoundException } from '@dooform-api-core/domain'

import type { DictionaryCollection } from '../../domain/entities/dictionary-collection.entity'
import { DictionaryScope, DictionaryStatus } from '../../domain/enums/dictionary.enum'

export interface DictionaryAccessContext {
  callerRole?: string
  callerOrganizationId?: string | null
  callerUserId?: string
}

/**
 * Read scope (collection-level — entries inherit visibility from their collection):
 *  - GLOBAL_ADMIN: always.
 *  - PERSONAL: only the owner.
 *  - ORGANIZATION: anyone in the same org.
 *  - GLOBAL: any authenticated caller, but only when status=PUBLISHED.
 *  - Otherwise: 404 (don't leak existence).
 */
export function assertCanReadCollection(
  collection: DictionaryCollection,
  ctx: DictionaryAccessContext,
): void {
  const props = collection.getProps()
  if (ctx.callerRole === 'GLOBAL_ADMIN') return

  if (props.scope === DictionaryScope.PERSONAL) {
    if (ctx.callerUserId && ctx.callerUserId === props.ownerUserId) return
  } else if (props.scope === DictionaryScope.ORGANIZATION) {
    if (ctx.callerOrganizationId && ctx.callerOrganizationId === props.organizationId) return
  } else if (props.scope === DictionaryScope.GLOBAL) {
    if (props.status === DictionaryStatus.PUBLISHED) return
  }
  throw new EntityNotFoundException(`Dictionary collection with id ${collection.id} not found`)
}

/**
 * Edit / delete a collection (and add/edit/delete its entries):
 *  - GLOBAL_ADMIN: always.
 *  - PERSONAL: only the owner.
 *  - ORGANIZATION: ORG_ADMIN of the same org, or the original author.
 *  - GLOBAL: GLOBAL_ADMIN only.
 */
export function assertCanEditCollection(
  collection: DictionaryCollection,
  ctx: DictionaryAccessContext,
): void {
  const props = collection.getProps()
  if (ctx.callerRole === 'GLOBAL_ADMIN') return

  if (props.scope === DictionaryScope.GLOBAL) {
    throw new ForbiddenException('Only a global admin can modify global dictionary collections')
  }
  if (props.scope === DictionaryScope.PERSONAL) {
    if (ctx.callerUserId && ctx.callerUserId === props.ownerUserId) return
    throw new ForbiddenException('You can only modify your own personal collections')
  }
  // ORGANIZATION
  const sameOrg = !!ctx.callerOrganizationId && ctx.callerOrganizationId === props.organizationId
  const isOwner = !!ctx.callerUserId && ctx.callerUserId === props.ownerUserId
  if (sameOrg && (ctx.callerRole === 'ORG_ADMIN' || isOwner)) return
  throw new ForbiddenException(
    'Only an organization admin or the original author can modify this collection',
  )
}

export function assertCanCreateInScope(
  scope: DictionaryScope,
  ctx: DictionaryAccessContext,
): void {
  if (ctx.callerRole === 'GLOBAL_ADMIN') return
  if (scope === DictionaryScope.PERSONAL) return
  if (scope === DictionaryScope.ORGANIZATION && ctx.callerRole === 'ORG_ADMIN' && ctx.callerOrganizationId) return
  throw new ForbiddenException(
    scope === DictionaryScope.GLOBAL
      ? 'Only a global admin can publish global dictionary collections'
      : 'Only an organization admin can create organization-scoped collections',
  )
}
