import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface AnnouncementProps extends IEntityProps {
  message: string
  linkUrl: string | null
  linkText: string | null
  organizationId: string | null
  isActive: boolean
  startsAt: Date | null
  endsAt: Date | null
  createdByUserId: string
}

/**
 * A broadcast banner shown at the top of the console. Each announcement is either
 *  - global (organizationId === null) — visible to every authenticated user, or
 *  - org-scoped — visible only to members of the matching organization.
 *
 * `isActive` is the master switch; the optional [startsAt, endsAt] window narrows it
 * further so a draft announcement can be staged ahead of time and auto-expire.
 */
export class Announcement extends Entity<AnnouncementProps> {
  static create(props: {
    message: string
    linkUrl?: string | null
    linkText?: string | null
    organizationId?: string | null
    isActive?: boolean
    startsAt?: Date | null
    endsAt?: Date | null
    createdByUserId: string
  }): Announcement {
    return new Announcement({
      message: props.message,
      linkUrl: props.linkUrl ?? null,
      linkText: props.linkText ?? null,
      organizationId: props.organizationId ?? null,
      isActive: props.isActive ?? true,
      startsAt: props.startsAt ?? null,
      endsAt: props.endsAt ?? null,
      createdByUserId: props.createdByUserId,
    })
  }

  get message(): string {
    return this.getProps().message
  }
  get linkUrl(): string | null {
    return this.getProps().linkUrl
  }
  get linkText(): string | null {
    return this.getProps().linkText
  }
  get organizationId(): string | null {
    return this.getProps().organizationId
  }
  get isActive(): boolean {
    return this.getProps().isActive
  }
  get startsAt(): Date | null {
    return this.getProps().startsAt
  }
  get endsAt(): Date | null {
    return this.getProps().endsAt
  }
  get createdByUserId(): string {
    return this.getProps().createdByUserId
  }

  setMessage(message: string): void {
    this.updateProp('message', message)
  }

  setLink(url: string | null, text: string | null): void {
    this.updateProp('linkUrl', url)
    this.updateProp('linkText', text)
  }

  setSchedule(startsAt: Date | null, endsAt: Date | null): void {
    this.updateProp('startsAt', startsAt)
    this.updateProp('endsAt', endsAt)
  }

  setOrganization(id: string | null): void {
    this.updateProp('organizationId', id)
  }

  activate(): void {
    this.updateProp('isActive', true)
  }

  deactivate(): void {
    this.updateProp('isActive', false)
  }
}
