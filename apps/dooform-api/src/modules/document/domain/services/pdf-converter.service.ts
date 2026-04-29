export interface IPdfConverterService {
  convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer>
  isAvailable(): Promise<boolean>
}
