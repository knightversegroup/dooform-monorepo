import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { DictionaryScope, DictionaryStatus } from '../enums/dictionary.enum'

export interface DictionaryCollectionProps extends IEntityProps {
  name: string
  description?: string | null
  scope: DictionaryScope
  status: DictionaryStatus
  organizationId: string | null
  ownerUserId: string
}

/**
 * A named container for dictionary entries. Visibility, status, and edit rights all
 * live at this level — the entries inside inherit them. Scopes:
 *  - PERSONAL: only the owner sees / edits.
 *  - ORGANIZATION: visible to anyone in the same org; ORG_ADMIN or original author can edit.
 *  - GLOBAL: marketplace listing — visible to all tenants once PUBLISHED;
 *    GLOBAL_ADMIN only for edits.
 */
export class DictionaryCollection extends Entity<DictionaryCollectionProps> {
  static create(props: {
    name: string
    description?: string | null
    scope: DictionaryScope
    organizationId: string | null
    ownerUserId: string
  }): DictionaryCollection {
    const status =
      props.scope === DictionaryScope.GLOBAL ? DictionaryStatus.DRAFT : DictionaryStatus.PUBLISHED
    return new DictionaryCollection({
      name: props.name,
      description: props.description ?? null,
      scope: props.scope,
      status,
      organizationId:
        props.scope === DictionaryScope.ORGANIZATION ? props.organizationId : null,
      ownerUserId: props.ownerUserId,
    })
  }

  get name(): string {
    return this.getProps().name
  }
  get scope(): DictionaryScope {
    return this.getProps().scope
  }
  get status(): DictionaryStatus {
    return this.getProps().status
  }
  get organizationId(): string | null {
    return this.getProps().organizationId
  }
  get ownerUserId(): string {
    return this.getProps().ownerUserId
  }

  updateName(name: string): void {
    this.updateProp('name', name)
  }
  updateDescription(description: string | null): void {
    this.updateProp('description', description)
  }
  publish(): void {
    this.updateProp('status', DictionaryStatus.PUBLISHED)
  }
  unpublish(): void {
    this.updateProp('status', DictionaryStatus.DRAFT)
  }
  /**
   * Scope changes also rebind organizationId, and reset GLOBAL collections back to DRAFT
   * so the admin can re-review before re-publishing.
   */
  changeScope(scope: DictionaryScope, organizationId: string | null): void {
    this.updateProp('scope', scope)
    this.updateProp(
      'organizationId',
      scope === DictionaryScope.ORGANIZATION ? organizationId : null,
    )
    this.updateProp(
      'status',
      scope === DictionaryScope.GLOBAL ? DictionaryStatus.DRAFT : DictionaryStatus.PUBLISHED,
    )
  }
}
