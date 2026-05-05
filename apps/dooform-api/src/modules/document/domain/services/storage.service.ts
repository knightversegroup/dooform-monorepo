export interface IStorageService {
  save(path: string, data: Buffer): Promise<void>
  read(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>

  /**
   * Walk every object under `prefix` and return the sum of their sizes in bytes.
   * Used by the storage-quota recompute job to reconcile a tenant's authoritative
   * usage from the backend (local filesystem in dev, Azure Blob in prod).
   *
   * Implementations should be cheap-enough to call from an admin button — pagination
   * + streaming is fine; bringing the whole listing into memory is not.
   */
  getTotalSize(prefix: string): Promise<number>
}
