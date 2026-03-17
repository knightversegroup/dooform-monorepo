import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import {
  TemplateStatus,
  TemplateType,
  TemplateTier,
  PageOrientation,
  TemplateCategory,
} from '../enums/template.enum'

export interface TemplateProps extends IEntityProps {
  filename: string
  originalName: string
  displayName: string
  name: string
  description: string | null
  author: string
  category: TemplateCategory | null
  filePathDocx: string
  filePathHtml: string
  filePathPdf: string
  filePathThumbnail: string
  fileSize: number
  mimeType: string
  placeholders: string // JSON string
  aliases: string // JSON string
  fieldDefinitions: string // JSON string
  originalSource: string
  remarks: string
  isVerified: boolean
  isAIAvailable: boolean
  status: TemplateStatus
  type: TemplateType
  tier: TemplateTier
  group: string
  documentTypeId: string | null
  variantName: string
  variantOrder: number
  pageOrientation: PageOrientation
}

export class Template extends Entity<TemplateProps> {
  static create(props: {
    filename: string
    originalName?: string
    displayName?: string
    name?: string
    description?: string | null
    author?: string
    type?: TemplateType
    tier?: TemplateTier
  }): Template {
    return new Template({
      filename: props.filename,
      originalName: props.originalName ?? props.filename,
      displayName: props.displayName ?? props.filename,
      name: props.name ?? '',
      description: props.description ?? null,
      author: props.author ?? '',
      category: null,
      filePathDocx: '',
      filePathHtml: '',
      filePathPdf: '',
      filePathThumbnail: '',
      fileSize: 0,
      mimeType: '',
      placeholders: '[]',
      aliases: '{}',
      fieldDefinitions: '{}',
      originalSource: '',
      remarks: '',
      isVerified: false,
      isAIAvailable: false,
      status: TemplateStatus.DRAFT,
      type: props.type ?? TemplateType.OFFICIAL,
      tier: props.tier ?? TemplateTier.FREE,
      group: '',
      documentTypeId: null,
      variantName: '',
      variantOrder: 0,
      pageOrientation: PageOrientation.PORTRAIT,
    })
  }

  get filename(): string {
    return this.getProp('filename')
  }

  get displayName(): string {
    return this.getProp('displayName')
  }

  get name(): string {
    return this.getProp('name')
  }

  get description(): string | null {
    return this.getProp('description')
  }

  get author(): string {
    return this.getProp('author')
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

  get placeholders(): string {
    return this.getProp('placeholders')
  }

  get aliases(): string {
    return this.getProp('aliases')
  }

  get fieldDefinitions(): string {
    return this.getProp('fieldDefinitions')
  }

  get documentTypeId(): string | null {
    return this.getProp('documentTypeId')
  }

  publish(): void {
    this.updateProp('status', TemplateStatus.PUBLISHED)
  }

  archive(): void {
    this.updateProp('status', TemplateStatus.ARCHIVED)
  }

  updateDisplayName(displayName: string): void {
    this.updateProp('displayName', displayName)
  }

  updateName(name: string): void {
    this.updateProp('name', name)
  }

  updateDescription(description: string | null): void {
    this.updateProp('description', description)
  }

  updateFilePaths(paths: {
    docx?: string
    html?: string
    pdf?: string
    thumbnail?: string
  }): void {
    if (paths.docx !== undefined) this.updateProp('filePathDocx', paths.docx)
    if (paths.html !== undefined) this.updateProp('filePathHtml', paths.html)
    if (paths.pdf !== undefined) this.updateProp('filePathPdf', paths.pdf)
    if (paths.thumbnail !== undefined) this.updateProp('filePathThumbnail', paths.thumbnail)
  }

  updateFieldDefinitions(fieldDefinitions: string): void {
    this.updateProp('fieldDefinitions', fieldDefinitions)
  }

  updatePlaceholders(placeholders: string): void {
    this.updateProp('placeholders', placeholders)
  }

  assignToDocumentType(documentTypeId: string, variantName: string, variantOrder: number): void {
    this.updateProps({
      documentTypeId,
      variantName,
      variantOrder,
    })
  }

  unassignFromDocumentType(): void {
    this.updateProps({
      documentTypeId: null,
      variantName: '',
      variantOrder: 0,
    })
  }

  /**
   * Returns the best available name for display (matching Go logic)
   */
  getDisplayLabel(): string {
    const displayName = this.getProp('displayName')
    if (displayName) return displayName
    const name = this.getProp('name')
    if (name) return name
    return this.getProp('originalName')
  }

  /**
   * Parse placeholders JSON to array
   */
  getParsedPlaceholders(): string[] {
    try {
      return JSON.parse(this.getProp('placeholders') || '[]')
    } catch {
      return []
    }
  }

  /**
   * Parse aliases JSON to map
   */
  getParsedAliases(): Record<string, string> {
    try {
      return JSON.parse(this.getProp('aliases') || '{}')
    } catch {
      return {}
    }
  }

  /**
   * Parse field definitions JSON to map
   */
  getParsedFieldDefinitions(): Record<string, any> {
    try {
      return JSON.parse(this.getProp('fieldDefinitions') || '{}')
    } catch {
      return {}
    }
  }
}
