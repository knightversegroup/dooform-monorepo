import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { DocumentStatus } from '../enums/document.enum'

export interface DocumentProps extends IEntityProps {
  templateId: string
  userId: string
  filename: string
  filePathDocx: string
  filePathPdf: string
  fileSize: number
  mimeType: string
  data: string
  status: DocumentStatus
}

export class Document extends Entity<DocumentProps> {
  static create(props: {
    id?: string
    templateId: string
    userId: string
    filename: string
    filePathDocx: string
    filePathPdf?: string
    fileSize: number
    mimeType: string
    data: string
    status?: DocumentStatus
  }): Document {
    return new Document({
      id: props.id,
      templateId: props.templateId,
      userId: props.userId,
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf ?? '',
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      data: props.data,
      status: props.status ?? DocumentStatus.COMPLETED,
    })
  }

  get templateId(): string {
    return this.getProp('templateId')
  }

  get userId(): string {
    return this.getProp('userId')
  }

  get filename(): string {
    return this.getProp('filename')
  }

  get filePathDocx(): string {
    return this.getProp('filePathDocx')
  }

  get filePathPdf(): string {
    return this.getProp('filePathPdf')
  }

  get fileSize(): number {
    return this.getProp('fileSize')
  }

  get mimeType(): string {
    return this.getProp('mimeType')
  }

  get data(): string {
    return this.getProp('data')
  }

  get status(): DocumentStatus {
    return this.getProp('status')
  }

  updateFilePathDocx(path: string): void {
    this.updateProp('filePathDocx', path)
  }

  updateFilePathPdf(path: string): void {
    this.updateProp('filePathPdf', path)
  }

  updateFileSize(size: number): void {
    this.updateProp('fileSize', size)
  }

  updateStatus(status: DocumentStatus): void {
    this.updateProp('status', status)
  }

  markAsDeleted(): void {
    this.delete()
  }
}
