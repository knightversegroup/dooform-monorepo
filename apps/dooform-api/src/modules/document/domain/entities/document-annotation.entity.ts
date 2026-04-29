import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface AnnotationItem {
  id: string
  type: 'text' | 'strikethrough'
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontColor?: string
  color?: string
  lineWidth?: number
}

export interface DocumentAnnotationProps extends IEntityProps {
  documentId: string
  userId: string
  version: number
  data: AnnotationItem[]
  finalized: boolean
}

export class DocumentAnnotation extends Entity<DocumentAnnotationProps> {
  static create(props: {
    documentId: string
    userId: string
    data: AnnotationItem[]
  }): DocumentAnnotation {
    return new DocumentAnnotation({
      documentId: props.documentId,
      userId: props.userId,
      version: 1,
      data: props.data,
      finalized: false,
    })
  }

  get documentId(): string {
    return this.getProp('documentId')
  }

  get userId(): string {
    return this.getProp('userId')
  }

  get version(): number {
    return this.getProp('version')
  }

  get data(): AnnotationItem[] {
    return this.getProp('data')
  }

  get finalized(): boolean {
    return this.getProp('finalized')
  }

  updateData(newData: AnnotationItem[], expectedVersion: number): void {
    if (this.version !== expectedVersion) {
      throw new Error('CONCURRENT_MODIFICATION')
    }
    if (this.finalized) {
      throw new Error('ANNOTATION_FINALIZED')
    }
    this.updateProp('data', newData)
    this.updateProp('version', this.version + 1)
  }

  finalize(): void {
    if (this.finalized) {
      throw new Error('ANNOTATION_ALREADY_FINALIZED')
    }
    this.updateProp('finalized', true)
  }
}
