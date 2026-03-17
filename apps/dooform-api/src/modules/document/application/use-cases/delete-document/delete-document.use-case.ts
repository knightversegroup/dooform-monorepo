import { Inject, Injectable, Logger } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import { DeleteDocumentDto } from '../../dtos/delete-document.dto'
import { StorageService } from '../../services/storage.service'

interface DeleteDocumentResult {
  message: string
}

@Injectable()
@UseClassLogger('document')
export class DeleteDocumentUseCase implements UseCase<DeleteDocumentDto, DeleteDocumentResult> {
  private readonly logger = new Logger(DeleteDocumentUseCase.name)

  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService: StorageService,
  ) {}

  @UseResult()
  @ValidateInput(DeleteDocumentDto)
  async execute(dto: DeleteDocumentDto): Promise<Result<DeleteDocumentResult>> {
    const document = await this.documentRepository.findById(dto.id)

    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }

    const props = document.getProps()

    // Delete files from storage (warn but don't fail)
    if (props.filePathDocx) {
      await this.storageService.deleteFile(props.filePathDocx).catch((err) => {
        this.logger.warn(`Failed to delete DOCX file ${props.filePathDocx}: ${err}`)
      })
    }
    if (props.filePathPdf) {
      await this.storageService.deleteFile(props.filePathPdf).catch((err) => {
        this.logger.warn(`Failed to delete PDF file ${props.filePathPdf}: ${err}`)
      })
    }

    await this.documentRepository.deleteById(dto.id)

    return { message: 'Document deleted successfully' } as any
  }
}
