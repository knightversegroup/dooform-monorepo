import { randomUUID, createHash } from 'node:crypto'

export default abstract class CryptoUtils {
  static generateUUID(): string {
    return randomUUID()
  }

  static hashMD5(data: string): string {
    return createHash('md5').update(data).digest('hex')
  }
}
