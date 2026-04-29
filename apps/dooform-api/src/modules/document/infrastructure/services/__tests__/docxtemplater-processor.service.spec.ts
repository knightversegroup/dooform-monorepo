import PizZip from 'pizzip'

import { DocxtemplaterProcessorService } from '../docxtemplater-processor.service'

function createMinimalDocx(bodyContent: string): Buffer {
  const zip = new PizZip()

  // Content_Types must declare the word/document.xml part for docxtemplater to recognize the filetype
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>'
  )

  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>'
  )

  zip.file(
    'word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>'
  )

  zip.file(
    'word/document.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' + bodyContent + '</w:body>' +
    '</w:document>'
  )

  return zip.generate({ type: 'nodebuffer' }) as Buffer
}

describe('DocxtemplaterProcessorService', () => {
  let service: DocxtemplaterProcessorService

  beforeEach(() => {
    service = new DocxtemplaterProcessorService()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should process a template buffer and return a buffer', async () => {
    const templateBuffer = createMinimalDocx(
      '<w:p><w:r><w:t>{{firstName}} {{lastName}}</w:t></w:r></w:p>'
    )

    const result = await service.processTemplate(templateBuffer, {
      firstName: 'John',
      lastName: 'Doe',
    })

    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)

    // Verify the output contains the replaced text
    const outputZip = new PizZip(result)
    const content = outputZip.file('word/document.xml')?.asText() ?? ''
    expect(content).toContain('John')
    expect(content).toContain('Doe')
    expect(content).not.toContain('{{firstName}}')
  })

  it('should replace missing placeholders with empty string', async () => {
    const templateBuffer = createMinimalDocx(
      '<w:p><w:r><w:t>{{missingField}}</w:t></w:r></w:p>'
    )

    const result = await service.processTemplate(templateBuffer, {})

    const outputZip = new PizZip(result)
    const content = outputZip.file('word/document.xml')?.asText() ?? ''
    expect(content).not.toContain('{{missingField}}')
  })

  it('should handle multiple placeholders', async () => {
    const templateBuffer = createMinimalDocx(
      '<w:p><w:r><w:t>Dear {{title}} {{name}}, your order #{{orderId}} is ready.</w:t></w:r></w:p>'
    )

    const result = await service.processTemplate(templateBuffer, {
      title: 'Mr.',
      name: 'Smith',
      orderId: '12345',
    })

    const outputZip = new PizZip(result)
    const content = outputZip.file('word/document.xml')?.asText() ?? ''
    expect(content).toContain('Mr.')
    expect(content).toContain('Smith')
    expect(content).toContain('12345')
  })
})
