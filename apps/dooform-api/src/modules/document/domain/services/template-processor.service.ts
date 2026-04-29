export interface ITemplateProcessorService {
  processTemplate(templateBuffer: Buffer, data: Record<string, string>): Promise<Buffer>
}
