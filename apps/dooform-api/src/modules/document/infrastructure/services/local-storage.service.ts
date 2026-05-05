import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'

import type { IStorageService } from '../../domain/services/storage.service'

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name)
  private readonly basePath: string

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>('LOCAL_STORAGE_PATH', './storage')
  }

  async save(filePath: string, data: Buffer): Promise<void> {
    const fullPath = this.resolvePath(filePath)
    const dir = path.dirname(fullPath)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, data)

    this.logger.debug(`File saved: ${filePath} (${data.length} bytes)`)
  }

  async read(filePath: string): Promise<Buffer> {
    const fullPath = this.resolvePath(filePath)
    return fs.readFile(fullPath)
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = this.resolvePath(filePath)
    try {
      await fs.unlink(fullPath)
      this.logger.debug(`File deleted: ${filePath}`)
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.resolvePath(filePath)
    try {
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Recursively walks the directory under `prefix` (relative to basePath) and sums
   * file sizes. In dev this gives an accurate answer for "how much space is this
   * tenant using" without needing to consult Postgres counters.
   */
  async getTotalSize(prefix: string): Promise<number> {
    const root = this.resolvePath(prefix)
    let total = 0
    const walk = async (dir: string): Promise<void> => {
      let entries: import('fs').Dirent[]
      try {
        entries = await fs.readdir(dir, { withFileTypes: true })
      } catch (err: any) {
        if (err.code === 'ENOENT') return // empty tenant
        throw err
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          await walk(full)
        } else if (entry.isFile()) {
          const stat = await fs.stat(full)
          total += stat.size
        }
      }
    }
    await walk(root)
    return total
  }

  private resolvePath(filePath: string): string {
    const resolved = path.resolve(this.basePath, filePath)
    if (!resolved.startsWith(path.resolve(this.basePath))) {
      throw new Error('Path traversal detected')
    }
    return resolved
  }
}
