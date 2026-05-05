export enum DocumentStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum DocumentFormat {
  DOCX = 'docx',
  PDF = 'pdf',
}

export enum UserTier {
  FREE = 'free',
  PRO = 'pro',
  MAX = 'max',
}

export enum DocumentLifecycleStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  SIGNED = 'SIGNED',
  ARCHIVED = 'ARCHIVED',
}
