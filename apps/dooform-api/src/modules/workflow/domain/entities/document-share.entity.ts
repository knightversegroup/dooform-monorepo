import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { ShareRole } from '../enums/workflow.enum'

export interface DocumentShareProps extends IEntityProps {
  documentId: string
  userId: string
  role: ShareRole
  grantedBy: string
}

export class DocumentShare extends Entity<DocumentShareProps> {
  static create(props: {
    documentId: string
    userId: string
    role: ShareRole
    grantedBy: string
  }): DocumentShare {
    return new DocumentShare({
      documentId: props.documentId,
      userId: props.userId,
      role: props.role,
      grantedBy: props.grantedBy,
    })
  }

  get documentId(): string { return this.getProp('documentId') }
  get userId(): string { return this.getProp('userId') }
  get role(): ShareRole { return this.getProp('role') }
  get grantedBy(): string { return this.getProp('grantedBy') }

  changeRole(role: ShareRole): void { this.updateProp('role', role) }
}
