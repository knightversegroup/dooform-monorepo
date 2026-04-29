import { Injectable, Logger } from '@nestjs/common'
import Docxtemplater from 'docxtemplater'
import InspectModule from 'docxtemplater/js/inspect-module'
import PizZip from 'pizzip'

import type { IPlaceholderExtractorService } from '../../domain/services/placeholder-extractor.service'

@Injectable()
export class DocxPlaceholderExtractorService implements IPlaceholderExtractorService {
  private readonly logger = new Logger(DocxPlaceholderExtractorService.name)

  async extractPlaceholders(docxBuffer: Buffer): Promise<string[]> {
    const zip = new PizZip(docxBuffer)
    const inspectModule = new InspectModule()

    new Docxtemplater(zip, {
      modules: [inspectModule],
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() {
        return ''
      },
    })

    const tags = inspectModule.getAllTags()
    const placeholders = this.flattenTags(tags)

    this.logger.debug(`Extracted ${placeholders.length} placeholders from DOCX`)
    return placeholders
  }

  private flattenTags(tags: Record<string, unknown>, prefix = ''): string[] {
    const result: string[] = []

    for (const key of Object.keys(tags)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = tags[key]

      if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
        // Nested object with keys (e.g. loop tags) — recurse
        result.push(...this.flattenTags(value as Record<string, unknown>, fullKey))
      } else {
        // Simple tag or empty object {} — this is a placeholder
        result.push(fullKey)
      }
    }

    return result
  }
}
