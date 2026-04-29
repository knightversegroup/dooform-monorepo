import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface DocumentTypeProps extends IEntityProps {
  code: string
  name: string
  nameEN?: string | null
  description?: string | null
  originalSource?: string | null
  category?: string | null
  icon?: string | null
  color?: string | null
  sortOrder?: number
  isActive?: boolean
  metadata?: Record<string, any> | null
}

export class DocumentType extends Entity<DocumentTypeProps> {
  static create(props: {
    code: string
    name: string
    nameEN?: string | null
    description?: string | null
    category?: string | null
    icon?: string | null
    color?: string | null
    sortOrder?: number
  }): DocumentType {
    return new DocumentType({
      code: props.code,
      name: props.name,
      nameEN: props.nameEN ?? null,
      description: props.description ?? null,
      originalSource: null,
      category: props.category ?? null,
      icon: props.icon ?? null,
      color: props.color ?? null,
      sortOrder: props.sortOrder ?? 0,
      isActive: true,
      metadata: null,
    })
  }

  get code(): string { return this.getProp('code') }
  get name(): string { return this.getProp('name') }
  get nameEN(): string | null | undefined { return this.getProp('nameEN') }
  get description(): string | null | undefined { return this.getProp('description') }
  get category(): string | null | undefined { return this.getProp('category') }
  get icon(): string | null | undefined { return this.getProp('icon') }
  get color(): string | null | undefined { return this.getProp('color') }
  get sortOrder(): number | undefined { return this.getProp('sortOrder') }
  get isActive(): boolean | undefined { return this.getProp('isActive') }
  get metadata(): Record<string, any> | null | undefined { return this.getProp('metadata') }

  updateName(name: string): void { this.updateProp('name', name) }
  updateNameEN(nameEN: string | null): void { this.updateProp('nameEN', nameEN) }
  updateDescription(description: string | null): void { this.updateProp('description', description) }
  updateCategory(category: string | null): void { this.updateProp('category', category) }
  updateIcon(icon: string | null): void { this.updateProp('icon', icon) }
  updateColor(color: string | null): void { this.updateProp('color', color) }
  updateSortOrder(sortOrder: number): void { this.updateProp('sortOrder', sortOrder) }
  activate(): void { this.updateProp('isActive', true) }
  deactivate(): void { this.updateProp('isActive', false) }
}
