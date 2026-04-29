import { Injectable, Logger } from '@nestjs/common'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

import type { AnnotationItem } from '../../domain/entities/document-annotation.entity'
import type { WatermarkConfig } from '../../domain/entities/watermark-preset.entity'

@Injectable()
export class PdfLibManipulatorService {
  private readonly logger = new Logger(PdfLibManipulatorService.name)

  async bakeAnnotations(pdfBuffer: Buffer, annotations: AnnotationItem[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    for (const annotation of annotations) {
      const page = pages[annotation.pageIndex]
      if (!page) continue

      const { width: pageWidth, height: pageHeight } = page.getSize()

      if (annotation.type === 'text' && annotation.content) {
        const fontSize = annotation.fontSize ?? 12
        const color = this.parseColor(annotation.fontColor ?? '#000000')
        const x = annotation.x
        const y = pageHeight - annotation.y - fontSize

        page.drawText(annotation.content, {
          x,
          y,
          size: fontSize,
          font,
          color,
        })
      } else if (annotation.type === 'strikethrough') {
        const color = this.parseColor(annotation.color ?? '#FF0000')
        const lineWidth = annotation.lineWidth ?? 2
        const x = annotation.x
        const y = pageHeight - annotation.y - (annotation.height / 2)

        page.drawLine({
          start: { x, y },
          end: { x: x + annotation.width, y },
          thickness: lineWidth,
          color,
        })
      }
    }

    const output = await pdfDoc.save()
    return Buffer.from(output)
  }

  async applyWatermark(
    pdfBuffer: Buffer,
    config: WatermarkConfig,
    logoBuffer?: Buffer,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | undefined
    if (logoBuffer) {
      try {
        logoImage = await pdfDoc.embedPng(logoBuffer)
      } catch {
        try {
          logoImage = await pdfDoc.embedJpg(logoBuffer)
        } catch (err) {
          this.logger.warn('Failed to embed logo image', err)
        }
      }
    }

    const pagesToWatermark = config.scope === 'first' ? [pages[0]] : pages

    for (const page of pagesToWatermark) {
      if (!page) continue
      const { width: pageWidth, height: pageHeight } = page.getSize()

      const opacity = config.opacity ?? 0.3
      const color = this.parseColor(config.fontColor ?? '#333333')
      const rotation = config.rotation ?? -45

      // Calculate position
      const pos = this.calculatePosition(config.position ?? 'bottomRight', pageWidth, pageHeight)
      const x = pos.x + (config.offsetX ?? 0)
      const y = pos.y + (config.offsetY ?? 0)

      // Draw logo if present
      if (logoImage) {
        const logoSize = config.logoSize ?? 40
        const logoDims = logoImage.scale(logoSize / Math.max(logoImage.width, logoImage.height))

        let logoX = x
        let logoY = y
        if (config.logoPosition === 'top') {
          logoY = y + 20
        } else if (config.logoPosition === 'left') {
          logoX = x - logoDims.width - 10
        }

        page.drawImage(logoImage, {
          x: logoX,
          y: logoY,
          width: logoDims.width,
          height: logoDims.height,
          opacity,
        })
      }

      // Draw text lines
      if (config.lines) {
        let textY = y
        for (const line of config.lines) {
          const fontSize = line.size ?? 12
          page.drawText(line.text, {
            x,
            y: textY,
            size: fontSize,
            font,
            color,
            opacity,
            rotate: degrees(rotation),
          })
          textY -= fontSize + 4
        }
      }
    }

    const output = await pdfDoc.save()
    return Buffer.from(output)
  }

  async applyBrandingWatermark(pdfBuffer: Buffer, text: string = 'DOOFORM'): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const fontSize = 24
    const opacity = 0.08
    const color = rgb(0.5, 0.5, 0.5)
    const rotation = -45

    for (const page of pages) {
      const { width: pageWidth, height: pageHeight } = page.getSize()

      // 3x3 grid
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = (pageWidth / 4) * (col + 1) - 40
          const y = (pageHeight / 4) * (row + 1)

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color,
            opacity,
            rotate: degrees(rotation),
          })
        }
      }
    }

    const output = await pdfDoc.save()
    return Buffer.from(output)
  }

  async getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    return pdfDoc.getPageCount()
  }

  private parseColor(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return rgb(0, 0, 0)
    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    )
  }

  private calculatePosition(
    position: string,
    pageWidth: number,
    pageHeight: number,
  ): { x: number; y: number } {
    const margin = 40
    switch (position) {
      case 'topLeft':
        return { x: margin, y: pageHeight - margin }
      case 'topCenter':
        return { x: pageWidth / 2, y: pageHeight - margin }
      case 'topRight':
        return { x: pageWidth - margin - 100, y: pageHeight - margin }
      case 'centerLeft':
        return { x: margin, y: pageHeight / 2 }
      case 'center':
        return { x: pageWidth / 2 - 50, y: pageHeight / 2 }
      case 'centerRight':
        return { x: pageWidth - margin - 100, y: pageHeight / 2 }
      case 'bottomLeft':
        return { x: margin, y: margin }
      case 'bottomCenter':
        return { x: pageWidth / 2, y: margin }
      case 'bottomRight':
      default:
        return { x: pageWidth - margin - 100, y: margin }
    }
  }
}
