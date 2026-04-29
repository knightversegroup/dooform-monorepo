import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  type ContainerClient,
} from '@azure/storage-blob'

import type { IStorageService } from '../../domain/services/storage.service'

@Injectable()
export class AzureBlobStorageService implements IStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name)
  private readonly containerClient: ContainerClient

  constructor(private readonly configService: ConfigService) {
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT')!
    const accountKey = this.configService.get<string>('AZURE_STORAGE_KEY')!
    const containerName = this.configService.get<string>('AZURE_CONTAINER_NAME', 'documents')

    const credential = new StorageSharedKeyCredential(accountName, accountKey)
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential,
    )
    this.containerClient = blobServiceClient.getContainerClient(containerName)

    this.logger.log(`Azure Blob Storage initialized: account=${accountName}, container=${containerName}`)
  }

  async save(filePath: string, data: Buffer): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath)
    await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: {
        blobContentType: this.detectContentType(filePath),
      },
    })
    this.logger.debug(`File uploaded to Azure: ${filePath} (${data.length} bytes)`)
  }

  async read(filePath: string): Promise<Buffer> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath)
    const downloadResponse = await blockBlobClient.download(0)

    const chunks: Buffer[] = []
    for await (const chunk of downloadResponse.readableStreamBody!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    return Buffer.concat(chunks)
  }

  async delete(filePath: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath)
    try {
      await blockBlobClient.delete()
      this.logger.debug(`File deleted from Azure: ${filePath}`)
    } catch (err: any) {
      if (err.statusCode !== 404) {
        throw err
      }
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath)
    return blockBlobClient.exists()
  }

  private detectContentType(filePath: string): string {
    if (filePath.endsWith('.pdf')) return 'application/pdf'
    if (filePath.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (filePath.endsWith('.png')) return 'image/png'
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
    return 'application/octet-stream'
  }
}
