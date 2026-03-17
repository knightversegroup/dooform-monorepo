export enum ThumbnailQuality {
  Normal = 'normal',
  HD = 'hd',
}

export interface LibreOfficeHealthResponse {
  status: string
  details?: {
    chromium?: { status: string }
    libreoffice?: { status: string }
    uno?: { status: string }
  }
}
