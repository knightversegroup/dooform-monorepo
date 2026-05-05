import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { ActivityType } from '../enums/workflow.enum'

export interface DocumentActivityProps extends IEntityProps {
  documentId: string
  userId: string
  type: ActivityType
  payload: Record<string, unknown>
}

export class DocumentActivity extends Entity<DocumentActivityProps> {
  static create(props: {
    documentId: string
    userId: string
    type: ActivityType
    payload?: Record<string, unknown>
  }): DocumentActivity {
    return new DocumentActivity({
      documentId: props.documentId,
      userId: props.userId,
      type: props.type,
      payload: props.payload ?? {},
    })
  }

  get documentId(): string { return this.getProp('documentId') }
  get userId(): string { return this.getProp('userId') }
  get type(): ActivityType { return this.getProp('type') }
  get payload(): Record<string, unknown> { return this.getProp('payload') }
}
