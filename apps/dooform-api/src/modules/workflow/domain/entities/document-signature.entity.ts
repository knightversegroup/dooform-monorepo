import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface DocumentSignatureProps extends IEntityProps {
  documentId: string
  userId: string
  imagePath: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
  signedAt: Date
}

export class DocumentSignature extends Entity<DocumentSignatureProps> {
  static create(props: {
    documentId: string
    userId: string
    imagePath: string
    pageIndex: number
    x: number
    y: number
    width: number
    height: number
  }): DocumentSignature {
    return new DocumentSignature({
      documentId: props.documentId,
      userId: props.userId,
      imagePath: props.imagePath,
      pageIndex: props.pageIndex,
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      signedAt: new Date(),
    })
  }

  get documentId(): string { return this.getProp('documentId') }
  get userId(): string { return this.getProp('userId') }
  get imagePath(): string { return this.getProp('imagePath') }
  get pageIndex(): number { return this.getProp('pageIndex') }
  get x(): number { return this.getProp('x') }
  get y(): number { return this.getProp('y') }
  get width(): number { return this.getProp('width') }
  get height(): number { return this.getProp('height') }
  get signedAt(): Date { return this.getProp('signedAt') }
}
