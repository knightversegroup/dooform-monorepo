import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { Logger } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import { DeleteDocumentDto } from '../../dtos/delete-document.dto'

interface DeleteDocumentResult {
  success: boolean
}

@Injectable()
@UseClassLogger('document')
export class DeleteDocumentUseCase implements UseCase<DeleteDocumentDto, DeleteDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  @UseResult()
  @ValidateInput(DeleteDocumentDto)
  async execute(dto: DeleteDocumentDto): Promise<Result<DeleteDocumentResult>> {
    const document = await this.documentRepository.findById(dto.id)

    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }

    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    // Soft delete in database
    await this.documentRepository.deleteById(dto.id)

    // Attempt to clean up storage files (non-fatal)
    const filePaths = [
      document.filePathDocx,
      document.filePathPdf,
      document.filePathFinalizedPdf,
    ].filter(Boolean) as string[]

    for (const filePath of filePaths) {
      try {
        await this.storageService.delete(filePath)
      } catch (err) {
        new Logger('DeleteDocumentUseCase').warn(`Failed to delete storage file: ${filePath}`)
      }
    }

    return { success: true } as any
  }
}
