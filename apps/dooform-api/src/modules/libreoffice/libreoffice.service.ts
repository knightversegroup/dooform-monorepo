import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import FormData from 'form-data'
import { firstValueFrom } from 'rxjs'

import { ThumbnailQuality, type LibreOfficeHealthResponse } from './libreoffice.types'

@Injectable()
export class LibreOfficeService {
  private readonly logger = new Logger(LibreOfficeService.name)
  private readonly serviceUrl: string
  private available = false
  private lastHealthCheck = 0

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.serviceUrl = this.configService.get<string>('LIBREOFFICE_URL', '')
    if (this.serviceUrl) {
      this.checkHealth()
    } else {
      this.logger.warn('LIBREOFFICE_URL not configured, conversion features disabled')
    }
  }

  private async checkHealth(): Promise<boolean> {
    if (!this.serviceUrl) return false

    try {
      const response = await firstValueFrom(
        this.httpService.get<LibreOfficeHealthResponse>(
          `${this.serviceUrl}/health`,
          { timeout: 5000 },
        ),
      )
      if (response.status === 200) {
        if (!this.available) {
          this.logger.log(`LibreOffice service available at: ${this.serviceUrl}`)
        }
        this.available = true
        this.lastHealthCheck = Date.now()
        return true
      }
    } catch {
      if (this.available) {
        this.logger.warn(`LibreOffice service unavailable at ${this.serviceUrl}`)
      }
    }

    this.available = false
    this.lastHealthCheck = Date.now()
    return false
  }

  private async ensureAvailable(): Promise<boolean> {
    if (this.available) return true
    if (Date.now() - this.lastHealthCheck > 30_000) {
      return this.checkHealth()
    }
    return false
  }

  async isAvailable(): Promise<boolean> {
    return this.ensureAvailable()
  }

  async isPDFConversionAvailable(): Promise<boolean> {
    return this.ensureAvailable()
  }

  async isHTMLConversionAvailable(): Promise<boolean> {
    return this.ensureAvailable()
  }

  async isThumbnailGenerationAvailable(): Promise<boolean> {
    return this.ensureAvailable()
  }

  async convertToPdf(docxBuffer: Buffer, filename: string): Promise<Buffer> {
    if (!(await this.ensureAvailable())) {
      throw new Error('LibreOffice service is not available')
    }

    const form = new FormData()
    form.append('files', docxBuffer, {
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const conversionUrl = `${this.serviceUrl}/forms/libreoffice/convert`
    this.logger.debug(`Converting to PDF: ${conversionUrl}`)

    const response = await firstValueFrom(
      this.httpService.post(conversionUrl, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 60_000,
      }),
    )

    if (response.status !== 200) {
      throw new Error(`LibreOffice PDF conversion failed: ${response.status}`)
    }

    return Buffer.from(response.data)
  }

  async convertToHtml(docxBuffer: Buffer, filename: string): Promise<Buffer> {
    if (!(await this.ensureAvailable())) {
      throw new Error('LibreOffice service is not available')
    }

    const form = new FormData()
    form.append('files', docxBuffer, {
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const conversionUrl = `${this.serviceUrl}/forms/libreoffice/convert/html`
    this.logger.debug(`Converting to HTML: ${conversionUrl}`)

    const response = await firstValueFrom(
      this.httpService.post(conversionUrl, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 60_000,
      }),
    )

    if (response.status !== 200) {
      throw new Error(`LibreOffice HTML conversion failed: ${response.status}`)
    }

    return Buffer.from(response.data)
  }

  async generateThumbnail(
    pdfBuffer: Buffer,
    filename: string,
    width = 300,
    quality: ThumbnailQuality = ThumbnailQuality.Normal,
  ): Promise<Buffer> {
    if (!(await this.ensureAvailable())) {
      throw new Error('LibreOffice service is not available')
    }

    const form = new FormData()
    form.append('files', pdfBuffer, {
      filename,
      contentType: 'application/pdf',
    })

    const thumbnailUrl =
      `${this.serviceUrl}/forms/libreoffice/thumbnail?width=${width}&quality=${quality}`
    this.logger.debug(`Generating thumbnail: ${thumbnailUrl}`)

    const response = await firstValueFrom(
      this.httpService.post(thumbnailUrl, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 30_000,
      }),
    )

    if (response.status !== 200) {
      throw new Error(`LibreOffice thumbnail generation failed: ${response.status}`)
    }

    return Buffer.from(response.data)
  }
}
