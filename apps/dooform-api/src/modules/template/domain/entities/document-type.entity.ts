import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface DocumentTypeProps extends IEntityProps {
  code: string
  name: string
  nameEn: string
  description: string
  originalSource: string
  category: string
  icon: string
  color: string
  sortOrder: number
  isActive: boolean
  metadata: string // JSON string
}

export class DocumentType extends Entity<DocumentTypeProps> {
  static create(props: {
    code: string
    name: string
    nameEn?: string
    description?: string
    originalSource?: string
    category?: string
    icon?: string
    color?: string
    sortOrder?: number
    metadata?: string
  }): DocumentType {
    return new DocumentType({
      code: props.code,
      name: props.name,
      nameEn: props.nameEn ?? '',
      description: props.description ?? '',
      originalSource: props.originalSource ?? '',
      category: props.category ?? '',
      icon: props.icon ?? '',
      color: props.color ?? '',
      sortOrder: props.sortOrder ?? 0,
      isActive: true,
      metadata: props.metadata ?? '{}',
    })
  }

  get code(): string {
    return this.getProp('code')
  }

  get name(): string {
    return this.getProp('name')
  }

  get nameEn(): string {
    return this.getProp('nameEn')
  }

  get description(): string {
    return this.getProp('description')
  }

  get category(): string {
    return this.getProp('category')
  }

  get sortOrder(): number {
    return this.getProp('sortOrder')
  }

  get isActive(): boolean {
    return this.getProp('isActive')
  }
}
