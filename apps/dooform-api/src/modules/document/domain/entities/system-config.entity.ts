import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface SystemConfigProps extends IEntityProps {
  key: string
  value: any
  updatedBy?: string | null
}

export class SystemConfig extends Entity<SystemConfigProps> {
  static create(props: {
    key: string
    value: any
    updatedBy?: string
  }): SystemConfig {
    return new SystemConfig({
      id: props.key,
      key: props.key,
      value: props.value,
      updatedBy: props.updatedBy ?? null,
    })
  }

  get key(): string {
    return this.getProp('key')
  }

  get value(): any {
    return this.getProp('value')
  }

  get updatedBy(): string | null | undefined {
    return this.getProp('updatedBy')
  }

  updateValue(value: any, updatedBy: string): void {
    this.updateProp('value', value)
    this.updateProp('updatedBy', updatedBy)
  }
}
