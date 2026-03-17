import { Injectable } from '@nestjs/common'
import * as JSZip from 'jszip'

@Injectable()
export class DocxProcessorService {
  /**
   * Extract all {{placeholder}} patterns from a DOCX buffer.
   * Matches the Go DocxProcessor.ExtractPlaceholders() logic.
   */
  async extractPlaceholders(docxBuffer: Buffer): Promise<string[]> {
    const zip = await JSZip.loadAsync(docxBuffer)

    const documentXml = zip.file('word/document.xml')
    if (!documentXml) {
      return []
    }

    const content = await documentXml.async('text')
    const cleanText = this.removeXMLTags(content)

    const placeholders: string[] = []
    const seen = new Set<string>()
    let pos = 0

    while (pos < cleanText.length) {
      const startIdx = cleanText.indexOf('{{', pos)
      if (startIdx === -1) break

      const endIdx = cleanText.indexOf('}}', startIdx)
      if (endIdx === -1) break

      const placeholder = cleanText.substring(startIdx, endIdx + 2)
      if (!seen.has(placeholder)) {
        placeholders.push(placeholder)
        seen.add(placeholder)
      }
      pos = endIdx + 2
    }

    return placeholders
  }

  /**
   * Remove XML tags from content (simple state machine matching Go logic)
   */
  private removeXMLTags(content: string): string {
    let result = ''
    let inTag = false

    for (const char of content) {
      if (char === '<') {
        inTag = true
      } else if (char === '>') {
        inTag = false
      } else if (!inTag) {
        result += char
      }
    }

    return result
  }
}
