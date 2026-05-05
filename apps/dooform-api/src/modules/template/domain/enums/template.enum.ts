export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TemplateType {
  FORM = 'FORM',
  SURVEY = 'SURVEY',
  QUIZ = 'QUIZ',
  OFFICIAL = 'OFFICIAL',
  PRIVATE = 'PRIVATE',
  COMMUNITY = 'COMMUNITY',
}

export enum TemplateTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TemplateCategory {
  FREQUENTLY_USED = 'FREQUENTLY_USED',
  IDENTIFICATION = 'IDENTIFICATION',
  CERTIFICATE = 'CERTIFICATE',
  CONTRACT = 'CONTRACT',
  APPLICATION = 'APPLICATION',
  FINANCIAL = 'FINANCIAL',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATION = 'EDUCATION',
  MEDICAL = 'MEDICAL',
  OTHER = 'OTHER',
}

export enum PageOrientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export enum TemplateVisibility {
  // Visible only to members of the owning organization. Default for org-admin uploads.
  ORGANIZATION = 'ORGANIZATION',
  // Visible to every tenant. Only GLOBAL_ADMIN may set this. Used for marketplace /
  // platform-wide templates.
  GLOBAL = 'GLOBAL',
}
