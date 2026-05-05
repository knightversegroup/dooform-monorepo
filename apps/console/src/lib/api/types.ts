export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TemplateType =
  | 'FORM'
  | 'SURVEY'
  | 'QUIZ'
  | 'OFFICIAL'
  | 'PRIVATE'
  | 'COMMUNITY';
export type TemplateTier =
  | 'FREE'
  | 'BASIC'
  | 'PRO'
  | 'PREMIUM'
  | 'ENTERPRISE';
export type TemplateCategory =
  | 'FREQUENTLY_USED'
  | 'IDENTIFICATION'
  | 'CERTIFICATE'
  | 'CONTRACT'
  | 'APPLICATION'
  | 'FINANCIAL'
  | 'GOVERNMENT'
  | 'EDUCATION'
  | 'MEDICAL'
  | 'OTHER';
export type PageOrientation = 'PORTRAIT' | 'LANDSCAPE';

export type TemplateVisibility = 'ORGANIZATION' | 'GLOBAL';

export interface Template {
  id: string;
  name: string;
  displayName?: string | null;
  description?: string | null;
  author?: string | null;
  type?: TemplateType;
  tier?: TemplateTier;
  visibility?: TemplateVisibility;
  category?: TemplateCategory;
  status?: TemplateStatus;
  pageOrientation?: PageOrientation;
  remarks?: string | null;
  organizationId?: string | null;
  ownerUserId?: string | null;
  owner?: { id: string; email: string; name: string } | null;
  fileSize?: number | null;
  mimeType?: string | null;
  originalFilename?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Optional metadata sometimes present
  thumbnailUrl?: string | null;
  documentTypeId?: string | null;
  variantName?: string | null;
  variantOrder?: number | null;
}

export interface TemplatesListResponse {
  data: Template[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GroupedTemplatesResponse {
  grouped: Record<string, Template[]>;
  ungrouped: Template[];
  total: number;
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  nameEN?: string | null;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentTypeTemplatesResponse = Template[];
export type DocumentTypesResponse = DocumentType[];
export type WatermarkPresetsResponse = WatermarkPreset[];

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'address';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  // Bare placeholder name (without `{{ }}`). This is the key used to fill the template
  // and to look up form values.
  placeholder: string;
  // Human-readable label shown in the form.
  label?: string;
  // Input behavior
  inputType?: FieldType | string;
  dataType?: string;
  required?: boolean;
  defaultValue?: string;
  options?: FieldOption[];
  description?: string;
  group?: string;
  groupOrder?: number;
  order?: number;
  entity?: string;
  // Optional UX hints (legacy)
  isMerged?: boolean;
  mergedFields?: string[];
  separator?: string;
  isRadioGroup?: boolean;
  radioGroupId?: string;
  /**
   * For radio groups, every option carries the bracket placeholder it fills in the
   * DOCX, the label shown to the user, and the tick character written into the
   * chosen placeholder (others get an empty string).
   */
  radioOptions?: Array<{
    placeholder: string;
    label?: string;
    value?: string;
  }>;
  validation?: Record<string, unknown>;
}

export interface FieldDefinitionsResponse {
  fieldDefinitions: FieldDefinition[];
}

export interface PlaceholdersResponse {
  placeholders: string[];
}

export type DocumentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'FINALIZED';

export interface DocumentRecord {
  id: string;
  templateId: string;
  templateName?: string | null;
  filename?: string | null;
  status: DocumentStatus | string;
  lifecycleStatus?:
    | 'DRAFT'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'SIGNED'
    | 'ARCHIVED';
  ownerUserId?: string;
  filePathDocx?: string | null;
  filePathPdf?: string | null;
  data?: Record<string, string> | null;
  createdAt?: string;
  updatedAt?: string;
  finalizedAt?: string | null;
}

export interface DocumentHistoryResponse {
  data: DocumentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AnnotationItem {
  id: string;
  type: 'text' | 'strikethrough';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontColor?: string;
  color?: string;
  lineWidth?: number;
}

export interface AnnotationsResponse {
  documentId: string;
  version: number;
  data: AnnotationItem[];
  finalized: boolean;
}

export interface WatermarkLine {
  text: string;
  bold?: boolean;
  size?: number;
}

export interface WatermarkConfig {
  lines: WatermarkLine[];
  fontColor?: string;
  opacity?: number;
  rotation?: number;
  position?: string;
  scope?: string;
}

export interface WatermarkPreset {
  id: string;
  name: string;
  config: WatermarkConfig;
  logoPath?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentFormat = 'docx' | 'pdf';

// --- Dictionary ---
export type DictionaryScope = 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL';
export type DictionaryStatus = 'DRAFT' | 'PUBLISHED';
export type DictionaryScopeFilter = 'ALL' | DictionaryScope;

export interface DictionaryCollection {
  id: string;
  name: string;
  description?: string | null;
  scope: DictionaryScope;
  status: DictionaryStatus;
  organizationId?: string | null;
  ownerUserId: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface DictionaryEntry {
  id: string;
  collectionId: string;
  term: string;
  termTh?: string | null;
  definition: string;
  definitionTh?: string | null;
  tags?: string[] | null;
  ownerUserId: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface DictionaryCollectionListResponse {
  data: DictionaryCollection[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DictionaryEntryListResponse {
  data: DictionaryEntry[];
  total: number;
  page: number;
  pageSize: number;
}
