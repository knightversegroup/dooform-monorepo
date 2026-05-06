import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import type { ITemplatePreviewService } from '../../domain/services/template-preview.service'
import { forceDocxFontImpl } from './force-docx-font'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data')

// The HTML LibreOffice emits keeps the original DOCX font names (e.g. Calibri) which
// aren't installed on most rendering machines, so the browser falls back unpredictably.
// We force Times New Roman everywhere in the preview for a consistent look.
const PREVIEW_FONT_STACK = '"Times New Roman", Times, "Liberation Serif", serif'

// Used both for the LibreOffice→PDF pipeline (we rewrite the DOCX XML) and as the
// declared font name LibreOffice will look up at render time.
const FORCED_DOCX_FONT = 'Times New Roman'

const THUMBNAIL_DEFAULT_QUALITY = 'hd'
const THUMBNAIL_DEFAULT_WIDTH = 1200

@Injectable()
export class TemplatePreviewService implements ITemplatePreviewService {
  private readonly logger = new Logger(TemplatePreviewService.name)
  private readonly serviceUrl: string
  private readonly timeout: number
  private readonly thumbnailQuality: string
  private readonly thumbnailWidth: number

  constructor(private readonly configService: ConfigService) {
    this.serviceUrl = this.configService.get<string>('LIBREOFFICE_URL', 'http://localhost:3001')
    this.timeout = this.configService.get<number>('CONVERSION_TIMEOUT', 60000)
    this.thumbnailQuality = this.configService.get<string>(
      'THUMBNAIL_QUALITY',
      THUMBNAIL_DEFAULT_QUALITY,
    )
    this.thumbnailWidth = this.configService.get<number>(
      'THUMBNAIL_WIDTH',
      THUMBNAIL_DEFAULT_WIDTH,
    )
  }

  /**
   * Rewrite every TEXT font reference in a DOCX to a single typeface, while leaving
   * symbol/dingbat fonts alone. Bullet glyphs, checkboxes, and special characters use
   * Wingdings/Symbol/Webdings/Courier New — rewriting those would render gibberish
   * (e.g. clapperboard glyphs in place of round bullets).
   */
  private forceDocxFont(docx: Buffer, font: string): Buffer {
    return forceDocxFontImpl(docx, font, this.logger)
  }

  /**
   * Force every element in the HTML preview to render in Times New Roman, regardless of
   * what fonts the source DOCX referenced (Calibri/Cambria/etc. that aren't installed).
   *
   * Strategy:
   *   1. Strip every `face="..."` attribute on `<font>` tags so legacy HTML4 styling
   *      can't fight us. (We keep the tag itself — removing it would change layout.)
   *   2. Inject a `<style>` block at the very end of `<head>` with a `* !important`
   *      rule pinning the font-family. Coming last + `!important` beats every
   *      class-based or inline style LibreOffice emits.
   */
  private patchHtmlFonts(html: string): string {
    let patched = html

    // 1) Strip `face="..."` on legacy <font> tags
    patched = patched.replace(/<font([^>]*)\sface\s*=\s*(["'])[^"']*\2/gi, '<font$1')

    // 2) Strip inline `font-family: ...` style declarations so the global override always wins
    patched = patched.replace(/font-family\s*:\s*[^;"']+(;?)/gi, '')

    const override = `<style id="dooform-font-override">
      html, body, * { font-family: ${PREVIEW_FONT_STACK} !important; }
    </style>`

    // Append to end of <head> so it overrides any earlier <style> blocks.
    if (/<\/head>/i.test(patched)) {
      patched = patched.replace(/<\/head>/i, `${override}</head>`)
    } else if (/<head[^>]*>/i.test(patched)) {
      patched = patched.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>${override}`)
    } else if (/<html[^>]*>/i.test(patched)) {
      patched = patched.replace(
        /<html([^>]*)>/i,
        (_m, attrs) => `<html${attrs}><head>${override}</head>`,
      )
    } else {
      patched = override + patched
    }
    return patched
  }

  async generateHtmlPreview(docxBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Generating HTML preview (${docxBuffer.length} bytes)`)

    const formData = new FormData()
    formData.append('files', docxBuffer, {
      filename: 'document.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    // Force fonts on the DOCX too so the LibreOffice→HTML output references Times
    // (the HTML-side rewrite below is belt-and-suspenders).
    const patchedDocx = this.forceDocxFont(docxBuffer, FORCED_DOCX_FONT)
    const formDataPatched = new FormData()
    formDataPatched.append('files', patchedDocx, {
      filename: 'document.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const response = await axios.post(
      `${this.serviceUrl}/forms/libreoffice/convert/html`,
      formDataPatched,
      {
        headers: formDataPatched.getHeaders(),
        responseType: 'arraybuffer',
        timeout: this.timeout,
      },
    )

    // Patch font fallbacks before returning so the browser renders Calibri/Cambria
    // runs with metric-compatible substitutes instead of blind serif fallback.
    const html = Buffer.from(response.data).toString('utf8')
    return Buffer.from(this.patchHtmlFonts(html), 'utf8')
  }

  async generatePdfPreview(docxBuffer: Buffer): Promise<Buffer> {
    this.logger.debug(`Generating PDF preview (${docxBuffer.length} bytes)`)

    // Force every font reference in the DOCX to Times New Roman before LibreOffice
    // sees the file — otherwise it falls back to Liberation Serif for any font that
    // isn't installed in the container (Calibri, Cambria, etc.).
    const patchedDocx = this.forceDocxFont(docxBuffer, FORCED_DOCX_FONT)

    const formData = new FormData()
    formData.append('files', patchedDocx, {
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

  async generateThumbnail(
    pdfBuffer: Buffer,
    overrides?: { quality?: string; width?: number },
  ): Promise<Buffer> {
    const quality = overrides?.quality ?? this.thumbnailQuality
    const width = overrides?.width ?? this.thumbnailWidth
    this.logger.debug(
      `Generating thumbnail from PDF (${pdfBuffer.length} bytes, quality=${quality}, width=${width})`,
    )

    const formData = new FormData()
    formData.append('files', pdfBuffer, {
      filename: 'preview.pdf',
      contentType: 'application/pdf',
    })

    // The Python LibreOffice service reads `quality` + `width` from query params:
    //   normal → pdftoppm @ 150 dpi, scale-to width=300 (default — blurry)
    //   hd     → pdftoppm @ 300 dpi, min width 800 (sharp, retina-friendly)
    const response = await axios.post(
      `${this.serviceUrl}/forms/libreoffice/thumbnail`,
      formData,
      {
        headers: formData.getHeaders(),
        params: { quality, width },
        responseType: 'arraybuffer',
        timeout: this.timeout,
      },
    )

    return Buffer.from(response.data)
  }
}
