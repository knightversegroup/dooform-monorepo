import { Entity, type IEntityProps } from '@dooform-api-core/domain'

import { TemplateStatus, TemplateType, TemplateTier, TemplateCategory, PageOrientation, TemplateVisibility } from '../enums/template.enum'
import type { FieldDefinition } from './field-definition.interface'

export interface TemplateProps extends IEntityProps {
  name: string
  displayName?: string | null
  description?: string | null
  author?: string | null
  status: TemplateStatus
  type: TemplateType
  tier: TemplateTier
  category?: TemplateCategory | null
  filePath?: string | null
  originalFilename?: string | null
  filePathHTML?: string | null
  filePathPDF?: string | null
  filePathThumbnail?: string | null
  fileSize?: number | null
  mimeType?: string | null
  placeholders?: string[] | null
  aliases?: Record<string, string> | null
  fieldDefinitions?: FieldDefinition[] | null
  originalSource?: string | null
  remarks?: string | null
  isVerified?: boolean
  isAIAvailable?: boolean
  group?: string | null
  documentTypeId?: string | null
  variantName?: string | null
  variantOrder?: number | null
  pageOrientation?: PageOrientation | null
  organizationId?: string | null
  ownerUserId?: string | null
  visibility?: TemplateVisibility
}

export class Template extends Entity<TemplateProps> {
  static create(props: {
    name: string
    displayName?: string | null
    description?: string | null
    author?: string | null
    type?: TemplateType
    tier?: TemplateTier
    category?: TemplateCategory | null
    pageOrientation?: PageOrientation | null
    organizationId?: string | null
    ownerUserId?: string | null
    visibility?: TemplateVisibility
  }): Template {
    return new Template({
      name: props.name,
      displayName: props.displayName ?? null,
      description: props.description ?? null,
      author: props.author ?? null,
      status: TemplateStatus.DRAFT,
      type: props.type ?? TemplateType.FORM,
      tier: props.tier ?? TemplateTier.FREE,
      category: props.category ?? null,
      filePath: null,
      originalFilename: null,
      filePathHTML: null,
      filePathPDF: null,
      filePathThumbnail: null,
      fileSize: null,
      mimeType: null,
      placeholders: null,
      aliases: null,
      fieldDefinitions: null,
      originalSource: null,
      remarks: null,
      isVerified: false,
      isAIAvailable: false,
      group: null,
      documentTypeId: null,
      variantName: null,
      variantOrder: null,
      pageOrientation: props.pageOrientation ?? null,
      organizationId: props.organizationId ?? null,
      ownerUserId: props.ownerUserId ?? null,
      visibility: props.visibility ?? TemplateVisibility.ORGANIZATION,
    })
  }

  get organizationId(): string | null { return this.getProp('organizationId') ?? null }
  get ownerUserId(): string | null { return this.getProp('ownerUserId') ?? null }
  get visibility(): TemplateVisibility { return this.getProp('visibility') ?? TemplateVisibility.ORGANIZATION }

  // --- Getters ---

  get name(): string { return this.getProp('name') }
  get displayName(): string | null | undefined { return this.getProp('displayName') }
  get description(): string | null | undefined { return this.getProp('description') }
  get author(): string | null | undefined { return this.getProp('author') }
  get status(): TemplateStatus { return this.getProp('status') }
  get type(): TemplateType { return this.getProp('type') }
  get tier(): TemplateTier { return this.getProp('tier') }
  get category(): TemplateCategory | null | undefined { return this.getProp('category') }
  get filePath(): string | null | undefined { return this.getProp('filePath') }
  get originalFilename(): string | null | undefined { return this.getProp('originalFilename') }
  get filePathHTML(): string | null | undefined { return this.getProp('filePathHTML') }
  get filePathPDF(): string | null | undefined { return this.getProp('filePathPDF') }
  get filePathThumbnail(): string | null | undefined { return this.getProp('filePathThumbnail') }
  get fileSize(): number | null | undefined { return this.getProp('fileSize') }
  get mimeType(): string | null | undefined { return this.getProp('mimeType') }
  get placeholders(): string[] | null | undefined { return this.getProp('placeholders') }
  get aliases(): Record<string, string> | null | undefined { return this.getProp('aliases') }
  get fieldDefinitions(): FieldDefinition[] | null | undefined { return this.getProp('fieldDefinitions') }
  get originalSource(): string | null | undefined { return this.getProp('originalSource') }
  get remarks(): string | null | undefined { return this.getProp('remarks') }
  get isVerified(): boolean | undefined { return this.getProp('isVerified') }
  get isAIAvailable(): boolean | undefined { return this.getProp('isAIAvailable') }
  get group(): string | null | undefined { return this.getProp('group') }
  get documentTypeId(): string | null | undefined { return this.getProp('documentTypeId') }
  get variantName(): string | null | undefined { return this.getProp('variantName') }
  get variantOrder(): number | null | undefined { return this.getProp('variantOrder') }
  get pageOrientation(): PageOrientation | null | undefined { return this.getProp('pageOrientation') }

  // --- Mutations ---

  setFilePath(filePath: string, originalFilename: string): void {
    this.updateProp('filePath', filePath)
    this.updateProp('originalFilename', originalFilename)
  }

  setFilePathHTML(path: string): void { this.updateProp('filePathHTML', path) }
  setFilePathPDF(path: string): void { this.updateProp('filePathPDF', path) }
  setFilePathThumbnail(path: string): void { this.updateProp('filePathThumbnail', path) }
  setFileSize(size: number): void { this.updateProp('fileSize', size) }
  setMimeType(mimeType: string): void { this.updateProp('mimeType', mimeType) }
  setPlaceholders(placeholders: string[]): void { this.updateProp('placeholders', placeholders) }
  setAliases(aliases: Record<string, string>): void { this.updateProp('aliases', aliases) }
  setFieldDefinitions(fieldDefs: FieldDefinition[]): void { this.updateProp('fieldDefinitions', fieldDefs) }
  setDocumentTypeId(id: string | null): void { this.updateProp('documentTypeId', id) }
  setVariant(name: string, order: number): void {
    this.updateProp('variantName', name)
    this.updateProp('variantOrder', order)
  }

  publish(): void { this.updateProp('status', TemplateStatus.PUBLISHED) }
  archive(): void { this.updateProp('status', TemplateStatus.ARCHIVED) }
  unpublish(): void { this.updateProp('status', TemplateStatus.DRAFT) }
  verify(): void { this.updateProp('isVerified', true) }
  unverify(): void { this.updateProp('isVerified', false) }

  updateName(name: string): void { this.updateProp('name', name) }
  updateDisplayName(displayName: string | null): void { this.updateProp('displayName', displayName) }
  updateDescription(description: string | null): void { this.updateProp('description', description) }
  updateAuthor(author: string | null): void { this.updateProp('author', author) }
  updateCategory(category: TemplateCategory | null): void { this.updateProp('category', category) }
  updateType(type: TemplateType): void { this.updateProp('type', type) }
  updateTier(tier: TemplateTier): void { this.updateProp('tier', tier) }
  updateRemarks(remarks: string | null): void { this.updateProp('remarks', remarks) }
  updatePageOrientation(orientation: PageOrientation | null): void { this.updateProp('pageOrientation', orientation) }
  updateGroup(group: string | null): void { this.updateProp('group', group) }
  updateIsAIAvailable(value: boolean): void { this.updateProp('isAIAvailable', value) }
  updateVisibility(visibility: TemplateVisibility): void { this.updateProp('visibility', visibility) }
  updateOrganizationId(organizationId: string | null): void { this.updateProp('organizationId', organizationId) }
}
