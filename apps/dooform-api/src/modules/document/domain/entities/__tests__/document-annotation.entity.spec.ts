import { DocumentAnnotation } from '../document-annotation.entity'

describe('DocumentAnnotation Entity', () => {
  it('should create a new annotation with version 1', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [
        { id: 'a1', type: 'text', pageIndex: 0, x: 100, y: 200, width: 150, height: 20, content: 'Hello', fontSize: 12, fontColor: '#000000' },
      ],
    })

    expect(annotation.documentId).toBe('doc-123')
    expect(annotation.userId).toBe('user-456')
    expect(annotation.version).toBe(1)
    expect(annotation.data).toHaveLength(1)
    expect(annotation.finalized).toBe(false)
  })

  it('should update data with correct version', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [],
    })

    const newData = [
      { id: 'a1', type: 'text' as const, pageIndex: 0, x: 100, y: 200, width: 150, height: 20, content: 'Updated' },
    ]

    annotation.updateData(newData, 1)
    expect(annotation.version).toBe(2)
    expect(annotation.data).toEqual(newData)
  })

  it('should throw on version mismatch', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [],
    })

    expect(() => annotation.updateData([], 999)).toThrow('CONCURRENT_MODIFICATION')
  })

  it('should throw when updating finalized annotation', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [],
    })

    annotation.finalize()
    expect(() => annotation.updateData([], 1)).toThrow('ANNOTATION_FINALIZED')
  })

  it('should finalize annotation', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [],
    })

    annotation.finalize()
    expect(annotation.finalized).toBe(true)
  })

  it('should throw when finalizing already finalized annotation', () => {
    const annotation = DocumentAnnotation.create({
      documentId: 'doc-123',
      userId: 'user-456',
      data: [],
    })

    annotation.finalize()
    expect(() => annotation.finalize()).toThrow('ANNOTATION_ALREADY_FINALIZED')
  })
})
