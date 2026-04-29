export interface IPlaceholderExtractorService {
  extractPlaceholders(docxBuffer: Buffer): Promise<string[]>
}
