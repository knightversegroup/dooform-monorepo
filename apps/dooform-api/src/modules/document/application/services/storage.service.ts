import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob'
import * as fs from 'fs'
import * as path from 'path'

export interface UploadResult {
  objectName: string
  size: number
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly storageType: string
  private readonly containerName: string
  private readonly localStoragePath: string
  private blobServiceClient?: BlobServiceClient
  private credential?: StorageSharedKeyCredential

  constructor(private readonly configService: ConfigService) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local')
    this.containerName = this.configService.get<string>('AZURE_CONTAINER_NAME', 'dooform-files')
    this.localStoragePath = this.configService.get<string>('LOCAL_STORAGE_BASE', './storage')

    if (this.storageType === 'azure') {
      const account = this.configService.get<string>('AZURE_STORAGE_ACCOUNT', '')
      const key = this.configService.get<string>('AZURE_STORAGE_KEY', '')
      if (account && key) {
        this.credential = new StorageSharedKeyCredential(account, key)
        this.blobServiceClient = new BlobServiceClient(
          `https://${account}.blob.core.windows.net`,
          this.credential,
        )
        this.logger.log('Azure Blob Storage initialized')
      }
    } else {
      fs.mkdirSync(this.localStoragePath, { recursive: true })
      this.logger.log(`Local storage initialized at: ${this.localStoragePath}`)
    }
  }

  async uploadFile(buffer: Buffer, objectName: string, contentType: string): Promise<UploadResult> {
    if (this.storageType === 'azure' && this.blobServiceClient) {
      return this.uploadToAzure(buffer, objectName, contentType)
    }
    return this.uploadToLocal(buffer, objectName)
  }

  async readFile(objectName: string): Promise<Buffer> {
    if (this.storageType === 'azure' && this.blobServiceClient) {
      return this.readFromAzure(objectName)
    }
    return this.readFromLocal(objectName)
  }

  async deleteFile(objectName: string): Promise<void> {
    if (this.storageType === 'azure' && this.blobServiceClient) {
      return this.deleteFromAzure(objectName)
    }
    return this.deleteFromLocal(objectName)
  }

  generateDocumentObjectName(documentId: string, filename: string): string {
    const timestamp = Math.floor(Date.now() / 1000)
    return `documents/${documentId}/${timestamp}_${filename}`
  }

  generateDocumentPDFObjectName(documentId: string, filename: string): string {
    const timestamp = Math.floor(Date.now() / 1000)
    const pdfFilename = filename.replace(/\.docx$/i, '.pdf')
    return `documents/${documentId}/${timestamp}_${pdfFilename}`
  }

  private async uploadToAzure(buffer: Buffer, objectName: string, contentType: string): Promise<UploadResult> {
    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName)
    const blobClient = containerClient.getBlockBlobClient(objectName)

    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    })

    return { objectName, size: buffer.length }
  }

  private async readFromAzure(objectName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName)
    const blobClient = containerClient.getBlockBlobClient(objectName)
    return blobClient.downloadToBuffer()
  }

  private async deleteFromAzure(objectName: string): Promise<void> {
    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName)
    const blobClient = containerClient.getBlockBlobClient(objectName)
    await blobClient.deleteIfExists()
  }

  private async uploadToLocal(buffer: Buffer, objectName: string): Promise<UploadResult> {
    const filePath = path.join(this.localStoragePath, objectName)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, buffer)
    return { objectName, size: buffer.length }
  }

  private async readFromLocal(objectName: string): Promise<Buffer> {
    const filePath = path.join(this.localStoragePath, objectName)
    return fs.readFileSync(filePath)
  }

  private async deleteFromLocal(objectName: string): Promise<void> {
    const filePath = path.join(this.localStoragePath, objectName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}
