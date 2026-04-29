import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import type { ITemplatePreviewService } from '../../domain/services/template-preview.service'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data')

@Injectable()
export class TemplatePreviewService implements ITemplatePreviewService {
  private readonly logger = new Logger(TemplatePreviewService.name)
  private readonly serviceUrl: string
  private readonly timeout: number

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('LIBREOFFICE_URL', 'http://localhost:3001')
    this.timeout = this.configService.get<number>('CONVERSION_TIMEOUT', 60000)
  }

  async generateHtmlPreview(docxBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Generating HTML preview (${docxBuffer.length} bytes)`)

    const formData = new FormData()
    formData.append('files', docxBuffer, {
      filename: 'document.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const response = await axios.post(
      `${this.serviceUrl}/forms/libreoffice/convert/html`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: this.timeout,
      },
    )

    return Buffer.from(response.data)
  }

  async generatePdfPreview(docxBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Generating PDF preview (${docxBuffer.length} bytes)`)

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

    return Buffer.from(response.data)
  }

  async generateThumbnail(pdfBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Generating thumbnail from PDF (${pdfBuffer.length} bytes)`)

    const formData = new FormData()
    formData.append('files', pdfBuffer, {
      filename: 'preview.pdf',
      contentType: 'application/pdf',
    })

    const response = await axios.post(
      `${this.serviceUrl}/forms/libreoffice/thumbnail`,
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: this.timeout,
      },
    )

    return Buffer.from(response.data)
  }
}
