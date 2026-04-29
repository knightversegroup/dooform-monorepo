import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IStorageService } from '../../../domain/services/storage.service'
import { GetDocumentDto } from '../../dtos/get-document.dto'

interface GetPdfPreviewResult {
  buffer: Buffer
  filename: string
}

@Injectable()
@UseClassLogger('document')
export class GetPdfPreviewUseCase implements UseCase<GetDocumentDto, GetPdfPreviewResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  @UseResult()
  @ValidateInput(GetDocumentDto)
  async execute(dto: GetDocumentDto): Promise<Result<GetPdfPreviewResult>> {
    const document = await this.documentRepository.findById(dto.id)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.id} not found`)
    }
    if (!document.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this document')
    }

    const pdfPath = document.filePathPdf
    if (!pdfPath) {
      throw new InvalidOperationException('No PDF file available for preview')
    }

    const buffer = await this.storageService.read(pdfPath)

    return {
      buffer,
      filename: document.filename.replace('.docx', '.pdf'),
    } as any
  }
}
