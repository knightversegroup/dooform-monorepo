import { Injectable } from '@nestjs/common'

import { LibreOfficeService } from '../../../libreoffice'

@Injectable()
export class ConversionService {
  constructor(private readonly libreOfficeService: LibreOfficeService) {}

  async isPDFConversionAvailable(): Promise<boolean> {
    return this.libreOfficeService.isPDFConversionAvailable()
  }

  async convertDocxToPdf(docxBuffer: Buffer, filename: string): Promise<Buffer> {
    return this.libreOfficeService.convertToPdf(docxBuffer, filename)
  }
}
