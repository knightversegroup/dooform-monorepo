export interface ITemplatePreviewService {
  generateHtmlPreview(docxBuffer: Buffer): Promise<Buffer>
  generatePdfPreview(docxBuffer: Buffer): Promise<Buffer>
  generateThumbnail(pdfBuffer: Buffer): Promise<Buffer>
}
