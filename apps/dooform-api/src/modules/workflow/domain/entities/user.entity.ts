import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface UserProps extends IEntityProps {
  email: string
  displayName: string
  avatarUrl?: string | null
}

export class User extends Entity<UserProps> {
  static create(props: { email: string; displayName: string; avatarUrl?: string | null }): User {
    return new User({
      email: props.email,
      displayName: props.displayName,
      avatarUrl: props.avatarUrl ?? null,
    })
  }

  get email(): string { return this.getProp('email') }
  get displayName(): string { return this.getProp('displayName') }
  get avatarUrl(): string | null | undefined { return this.getProp('avatarUrl') }

  rename(displayName: string): void { this.updateProp('displayName', displayName) }
  setAvatar(url: string | null): void { this.updateProp('avatarUrl', url) }
}
