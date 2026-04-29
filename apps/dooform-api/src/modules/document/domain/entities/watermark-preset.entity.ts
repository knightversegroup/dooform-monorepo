import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface WatermarkLine {
  text: string
  bold?: boolean
  size?: number
}

export interface WatermarkConfig {
  lines: WatermarkLine[]
  fontColor?: string
  opacity?: number
  rotation?: number
  position?: string
  offsetX?: number
  offsetY?: number
  shape?: 'rounded' | 'circle' | 'none'
  scope?: 'all' | 'first'
  logoSize?: number
  logoPosition?: 'top' | 'left' | 'right'
}

export interface WatermarkPresetProps extends IEntityProps {
  userId: string
  name: string
  config: WatermarkConfig
  logoPath?: string | null
}

export class WatermarkPreset extends Entity<WatermarkPresetProps> {
  static create(props: {
    userId: string
    name: string
    config: WatermarkConfig
  }): WatermarkPreset {
    return new WatermarkPreset({
      userId: props.userId,
      name: props.name,
      config: props.config,
      logoPath: null,
    })
  }

  get userId(): string {
    return this.getProp('userId')
  }

  get name(): string {
    return this.getProp('name')
  }

  get config(): WatermarkConfig {
    return this.getProp('config')
  }

  get logoPath(): string | null | undefined {
    return this.getProp('logoPath')
  }

  updateName(name: string): void {
    this.updateProp('name', name)
  }

  updateConfig(config: WatermarkConfig): void {
    this.updateProp('config', config)
  }

  setLogoPath(path: string): void {
    this.updateProp('logoPath', path)
  }

  clearLogoPath(): void {
    this.updateProp('logoPath', null)
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId
  }
}
