export interface IStorageService {
  save(path: string, data: Buffer): Promise<void>
  read(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
}
