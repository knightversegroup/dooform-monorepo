import { Injectable, Logger } from '@nestjs/common'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

import type { ITemplateProcessorService } from '../../domain/services/template-processor.service'

@Injectable()
export class DocxtemplaterProcessorService implements ITemplateProcessorService {
  private readonly logger = new Logger(DocxtemplaterProcessorService.name)

  async processTemplate(templateBuffer: Buffer, data: Record<string, string>): Promise<Buffer> {
    this.logger.debug(`Processing template with ${Object.keys(data).length} placeholders`)

    const zip = new PizZip(templateBuffer)

    const doc = new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() {
        return ''
      },
    })

    doc.render(data)

    const output = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    this.logger.debug(`Template processed successfully, output size: ${output.length} bytes`)

    return output as Buffer
  }
}
