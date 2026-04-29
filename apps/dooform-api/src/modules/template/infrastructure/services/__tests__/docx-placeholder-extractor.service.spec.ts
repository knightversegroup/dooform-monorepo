import PizZip from 'pizzip'

import { DocxPlaceholderExtractorService } from '../docx-placeholder-extractor.service'

function createMinimalDocx(bodyContent: string): Buffer {
  const zip = new PizZip()

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

describe('DocxPlaceholderExtractorService', () => {
  let service: DocxPlaceholderExtractorService

  beforeEach(() => {
    service = new DocxPlaceholderExtractorService()
  })

  it('should extract placeholders from DOCX', async () => {
    const docx = createMinimalDocx(
      '<w:p><w:r><w:t>{{first_name}} {{last_name}}</w:t></w:r></w:p>'
    )

    const result = await service.extractPlaceholders(docx)

    expect(result).toContain('first_name')
    expect(result).toContain('last_name')
    expect(result).toHaveLength(2)
  })

  it('should return empty array for DOCX without placeholders', async () => {
    const docx = createMinimalDocx(
      '<w:p><w:r><w:t>No placeholders here</w:t></w:r></w:p>'
    )

    const result = await service.extractPlaceholders(docx)

    expect(result).toEqual([])
  })

  it('should extract multiple placeholders', async () => {
    const docx = createMinimalDocx(
      '<w:p><w:r><w:t>{{child_first_name}} {{child_last_name}} {{child_date}} {{mother_name}}</w:t></w:r></w:p>'
    )

    const result = await service.extractPlaceholders(docx)

    expect(result).toHaveLength(4)
    expect(result).toContain('child_first_name')
    expect(result).toContain('child_last_name')
    expect(result).toContain('child_date')
    expect(result).toContain('mother_name')
  })
})
