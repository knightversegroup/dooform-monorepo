import { Entity, type IEntityProps } from '@dooform-api-core/domain'

export interface DocumentCommentProps extends IEntityProps {
  documentId: string
  userId: string
  body: string
  parentId?: string | null
}

export class DocumentComment extends Entity<DocumentCommentProps> {
  static create(props: {
    documentId: string
    userId: string
    body: string
    parentId?: string | null
  }): DocumentComment {
    return new DocumentComment({
      documentId: props.documentId,
      userId: props.userId,
      body: props.body,
      parentId: props.parentId ?? null,
    })
  }

  get documentId(): string { return this.getProp('documentId') }
  get userId(): string { return this.getProp('userId') }
  get body(): string { return this.getProp('body') }
  get parentId(): string | null | undefined { return this.getProp('parentId') }
}
