export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// Matches Go: official, private, community
export enum TemplateType {
  OFFICIAL = 'official',
  PRIVATE = 'private',
  COMMUNITY = 'community',
}

// Matches Go: free, basic, premium, enterprise
export enum TemplateTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum PageOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum TemplateCategory {
  FREQUENTLY_USED = 'frequently_used',
}
