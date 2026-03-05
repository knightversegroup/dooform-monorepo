import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { TemplateStatus, TemplateType, TemplateTier } from '../enums/template.enum'

export interface TemplateProps extends IEntityProps {
  name: string
  description?: string | null
  status: TemplateStatus
  type: TemplateType
  tier: TemplateTier
}

export class Template extends Entity<TemplateProps> {
  static create(props: {
    name: string
    description?: string | null
    type?: TemplateType
    tier?: TemplateTier
  }): Template {
    return new Template({
      name: props.name,
      description: props.description ?? null,
      status: TemplateStatus.DRAFT,
      type: props.type ?? TemplateType.FORM,
      tier: props.tier ?? TemplateTier.FREE,
    })
  }

  get name(): string {
    return this.getProp('name')
  }

  get description(): string | null | undefined {
    return this.getProp('description')
  }

  get status(): TemplateStatus {
    return this.getProp('status')
  }

  get type(): TemplateType {
    return this.getProp('type')
  }

  get tier(): TemplateTier {
    return this.getProp('tier')
  }

  publish(): void {
    this.updateProp('status', TemplateStatus.PUBLISHED)
  }

  archive(): void {
    this.updateProp('status', TemplateStatus.ARCHIVED)
  }

  updateName(name: string): void {
    this.updateProp('name', name)
  }

  updateDescription(description: string | null): void {
    this.updateProp('description', description)
  }
}
