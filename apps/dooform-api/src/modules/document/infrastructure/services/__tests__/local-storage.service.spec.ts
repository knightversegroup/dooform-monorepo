import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

import { LocalStorageService } from '../local-storage.service'

describe('LocalStorageService', () => {
  let service: LocalStorageService
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dooform-test-'))
    const mockConfigService = {
      get: (key: string, defaultValue?: string) => {
        if (key === 'LOCAL_STORAGE_PATH') return tempDir
        return defaultValue
      },
    }
    service = new LocalStorageService(mockConfigService as any)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should save and read a file', async () => {
    const data = Buffer.from('Hello World')
    await service.save('test/file.txt', data)

    const result = await service.read('test/file.txt')
    expect(result.toString()).toBe('Hello World')
  })

  it('should check file existence', async () => {
    expect(await service.exists('nonexistent.txt')).toBe(false)

    await service.save('exists.txt', Buffer.from('data'))
    expect(await service.exists('exists.txt')).toBe(true)
  })

  it('should delete a file', async () => {
    await service.save('to-delete.txt', Buffer.from('data'))
    expect(await service.exists('to-delete.txt')).toBe(true)

    await service.delete('to-delete.txt')
    expect(await service.exists('to-delete.txt')).toBe(false)
  })

  it('should not throw when deleting non-existent file', async () => {
    await expect(service.delete('nonexistent.txt')).resolves.not.toThrow()
  })

  it('should create nested directories', async () => {
    const data = Buffer.from('nested data')
    await service.save('a/b/c/deep.txt', data)

    const result = await service.read('a/b/c/deep.txt')
    expect(result.toString()).toBe('nested data')
  })

  it('should prevent path traversal', () => {
    expect(service.save('../../../etc/passwd', Buffer.from('hack'))).rejects.toThrow('Path traversal detected')
  })
})
