import { Injectable, Logger } from '@nestjs/common'
import * as path from 'path'
import JSZip from 'jszip'

@Injectable()
export class DocxProcessorService {
  private readonly logger = new Logger(DocxProcessorService.name)

  async process(templateBuffer: Buffer, placeholders: Record<string, string>): Promise<Buffer> {
    this.logger.log(`Starting DOCX processing with ${Object.keys(placeholders).length} placeholders`)

    const zip = await JSZip.loadAsync(templateBuffer)

    const xmlFiles = this.getDocxXMLFiles(zip)
    this.logger.log(`Processing ${xmlFiles.length} XML files: ${xmlFiles.join(', ')}`)

    for (const xmlFile of xmlFiles) {
      const file = zip.file(xmlFile)
      if (!file) {
        this.logger.warn(`File not found, skipping: ${xmlFile}`)
        continue
      }

      let content = await file.async('string')
      const cleanText = this.removeXMLTags(content)
      let modified = false

      for (const [placeholder, value] of Object.entries(placeholders)) {
        if (!cleanText.includes(placeholder)) {
          continue
        }

        this.logger.debug(`Placeholder "${placeholder}" found in ${xmlFile}`)
        const escapedValue = this.escapeXML(value)
        content = this.replaceWithXMLHandling(content, placeholder, escapedValue)
        modified = true
      }

      if (modified) {
        zip.file(xmlFile, content)
        this.logger.debug(`Successfully modified ${xmlFile}`)
      }
    }

    const result = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })

    this.logger.log('DOCX processing completed')
    return result
  }

  private getDocxXMLFiles(zip: JSZip): string[] {
    const files = ['word/document.xml']

    zip.forEach((relativePath) => {
      const name = path.basename(relativePath)
      if (relativePath.startsWith('word/')) {
        if (
          (name.startsWith('header') && name.endsWith('.xml')) ||
          (name.startsWith('footer') && name.endsWith('.xml'))
        ) {
          files.push(relativePath)
        }
      }
    })

    return files
  }

  private replaceWithXMLHandling(content: string, placeholder: string, value: string): string {
    if (content.includes(placeholder)) {
      return content.split(placeholder).join(value)
    }

    const [result] = this.replaceXMLSplit(content, placeholder, value)
    return result
  }

  private replaceXMLSplit(content: string, placeholder: string, value: string): [string, boolean] {
    interface TextSpan {
      start: number
      end: number
      text: string
    }

    const spans: TextSpan[] = []
    let pos = 0

    while (true) {
      const tagStart = content.indexOf('<w:t', pos)
      if (tagStart === -1) break

      const tagEnd = content.indexOf('>', tagStart)
      if (tagEnd === -1) break

      const textStart = tagEnd + 1
      const closeTag = content.indexOf('</w:t>', textStart)
      if (closeTag === -1) {
        pos = textStart
        continue
      }

      spans.push({
        start: textStart,
        end: closeTag,
        text: content.substring(textStart, closeTag),
      })

      pos = closeTag + 6
    }

    if (spans.length === 0) {
      return [content, false]
    }

    const concatenated = spans.map((s) => s.text).join('')
    const idx = concatenated.indexOf(placeholder)
    if (idx === -1) {
      return [content, false]
    }

    let charCount = 0
    let startSpanIdx = -1
    let startOffset = 0
    let endSpanIdx = -1
    let endOffset = 0
    const placeholderEnd = idx + placeholder.length

    for (let i = 0; i < spans.length; i++) {
      const spanStart = charCount
      const spanEnd = charCount + spans[i].text.length

      if (startSpanIdx === -1 && idx >= spanStart && idx < spanEnd) {
        startSpanIdx = i
        startOffset = idx - spanStart
      }

      if (placeholderEnd > spanStart && placeholderEnd <= spanEnd) {
        endSpanIdx = i
        endOffset = placeholderEnd - spanStart
        break
      }

      charCount = spanEnd
    }

    if (startSpanIdx === -1 || endSpanIdx === -1) {
      return [content, false]
    }

    let result = ''
    let lastEnd = 0

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i]
      result += content.substring(lastEnd, span.start)

      if (i === startSpanIdx && i === endSpanIdx) {
        result += span.text.substring(0, startOffset) + value + span.text.substring(endOffset)
      } else if (i === startSpanIdx) {
        result += span.text.substring(0, startOffset) + value
      } else if (i > startSpanIdx && i < endSpanIdx) {
        // Middle spans — empty them
      } else if (i === endSpanIdx) {
        result += span.text.substring(endOffset)
      } else {
        result += span.text
      }

      lastEnd = span.end
    }

    result += content.substring(lastEnd)

    // Recursively replace if there are more occurrences
    if (this.removeXMLTags(result).includes(placeholder)) {
      return this.replaceXMLSplit(result, placeholder, value)
    }

    return [result, true]
  }

  private escapeXML(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

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
