import { Document } from '../document.entity'
import { DocumentStatus } from '../../enums/document.enum'

describe('Document Entity', () => {
  it('should create a new document with PROCESSING status', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: { firstName: 'John', lastName: 'Doe' },
    })

    expect(document.templateId).toBe('template-123')
    expect(document.userId).toBe('user-456')
    expect(document.filename).toBe('test.docx')
    expect(document.data).toEqual({ firstName: 'John', lastName: 'Doe' })
    expect(document.status).toBe(DocumentStatus.PROCESSING)
    expect(document.filePathDocx).toBeNull()
    expect(document.filePathPdf).toBeNull()
    expect(document.filePathFinalizedPdf).toBeNull()
    expect(document.id).toBeDefined()
  })

  it('should mark document as completed', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: {},
    })

    document.markCompleted()
    expect(document.status).toBe(DocumentStatus.COMPLETED)
  })

  it('should mark document as failed', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: {},
    })

    document.markFailed()
    expect(document.status).toBe(DocumentStatus.FAILED)
  })

  it('should set file paths', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: {},
    })

    document.setFilePathDocx('documents/123/test.docx')
    document.setFilePathPdf('documents/123/test.pdf')
    document.setFilePathFinalizedPdf('documents/123/test_finalized.pdf')

    expect(document.filePathDocx).toBe('documents/123/test.docx')
    expect(document.filePathPdf).toBe('documents/123/test.pdf')
    expect(document.filePathFinalizedPdf).toBe('documents/123/test_finalized.pdf')
  })

  it('should check ownership correctly', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: {},
    })

    expect(document.isOwnedBy('user-456')).toBe(true)
    expect(document.isOwnedBy('user-789')).toBe(false)
  })

  it('should set file size and mime type', () => {
    const document = Document.create({
      templateId: 'template-123',
      userId: 'user-456',
      filename: 'test.docx',
      data: {},
    })

    document.setFileSize(1024)
    document.setMimeType('application/pdf')

    expect(document.fileSize).toBe(1024)
    expect(document.mimeType).toBe('application/pdf')
  })
})
