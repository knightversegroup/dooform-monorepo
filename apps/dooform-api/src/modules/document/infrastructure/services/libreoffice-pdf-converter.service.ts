import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import type { IPdfConverterService } from '../../domain/services/pdf-converter.service'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data')

@Injectable()
export class LibreOfficePdfConverterService implements IPdfConverterService {
  private readonly logger = new Logger(LibreOfficePdfConverterService.name)
  private readonly serviceUrl: string
  private readonly timeout: number

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('LIBREOFFICE_URL', 'http://localhost:3001')
    this.timeout = this.configService.get<number>('CONVERSION_TIMEOUT', 60000)
  }

  async convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Converting DOCX to PDF (${docxBuffer.length} bytes) via LibreOffice at ${this.serviceUrl}`)

    const formData = new FormData()
    formData.append('files', docxBuffer, {
      filename: 'document.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const response = await axios.post(
      `${this.serviceUrl}/forms/libreoffice/convert`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: this.timeout,
      },
    )

    const pdfBuffer = Buffer.from(response.data)
    this.logger.debug(`PDF conversion successful, output size: ${pdfBuffer.length} bytes`)

    return pdfBuffer
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.serviceUrl}/health`, { timeout: 5000 })
      return response.status === 200
    } catch {
      return false
    }
  }
}
