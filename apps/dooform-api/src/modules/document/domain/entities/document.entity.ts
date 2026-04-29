import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { DocumentStatus } from '../enums/document.enum'

export interface DocumentProps extends IEntityProps {
  templateId: string
  userId: string
  filename: string
  filePathDocx?: string | null
  filePathPdf?: string | null
  filePathFinalizedPdf?: string | null
  data: Record<string, string>
  status: DocumentStatus
  fileSize?: number | null
  mimeType?: string | null
}

export class Document extends Entity<DocumentProps> {
  static create(props: {
    templateId: string
    userId: string
    filename: string
    data: Record<string, string>
  }): Document {
    return new Document({
      templateId: props.templateId,
      userId: props.userId,
      filename: props.filename,
      data: props.data,
      status: DocumentStatus.PROCESSING,
      filePathDocx: null,
      filePathPdf: null,
      filePathFinalizedPdf: null,
      fileSize: null,
      mimeType: null,
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

  get filePathDocx(): string | null | undefined {
    return this.getProp('filePathDocx')
  }

  get filePathPdf(): string | null | undefined {
    return this.getProp('filePathPdf')
  }

  get filePathFinalizedPdf(): string | null | undefined {
    return this.getProp('filePathFinalizedPdf')
  }

  get data(): Record<string, string> {
    return this.getProp('data')
  }

  get status(): DocumentStatus {
    return this.getProp('status')
  }

  get fileSize(): number | null | undefined {
    return this.getProp('fileSize')
  }

  get mimeType(): string | null | undefined {
    return this.getProp('mimeType')
  }

  markCompleted(): void {
    this.updateProp('status', DocumentStatus.COMPLETED)
  }

  markFailed(): void {
    this.updateProp('status', DocumentStatus.FAILED)
  }

  setFilePathDocx(path: string): void {
    this.updateProp('filePathDocx', path)
  }

  setFilePathPdf(path: string): void {
    this.updateProp('filePathPdf', path)
  }

  setFilePathFinalizedPdf(path: string): void {
    this.updateProp('filePathFinalizedPdf', path)
  }

  setFileSize(size: number): void {
    this.updateProp('fileSize', size)
  }

  setMimeType(mimeType: string): void {
    this.updateProp('mimeType', mimeType)
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId
  }
}
