import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult, ValidateInput } from '@dooform-api-core/shared/decorators'

import type { IDocumentRepository } from '../../../domain/repositories/document.repository'
import type { IDocumentShareRepository } from '../../../../workflow/domain/repositories/document-share.repository'
import { ShareRole } from '../../../../workflow/domain/enums/workflow.enum'
import { RenameDocumentDto } from '../../dtos/rename-document.dto'

interface RenameDocumentResult {
  id: string
  filename: string
}

@Injectable()
@UseClassLogger('document')
export class RenameDocumentUseCase implements UseCase<RenameDocumentDto, RenameDocumentResult> {
  constructor(
    @Inject('IDocumentRepository')
    private readonly documentRepository: IDocumentRepository,
    @Inject('IDocumentShareRepository')
    private readonly shareRepository: IDocumentShareRepository,
  ) {}

  @UseResult()
  @ValidateInput(RenameDocumentDto)
  async execute(dto: RenameDocumentDto): Promise<Result<RenameDocumentResult>> {
    const document = await this.documentRepository.findById(dto.documentId)
    if (!document) {
      throw new EntityNotFoundException(`Document with id ${dto.documentId} not found`)
    }

    // Owner OR EDITOR-shared user can rename in place.
    if (!document.isOwnedBy(dto.userId)) {
      const share = await this.shareRepository.findByDocumentAndUser(
        document.id,
        dto.userId,
      )
      const role = share?.role ?? null
      if (role !== ShareRole.OWNER && role !== ShareRole.EDITOR) {
        throw new UnauthorizedAccessException(
          'You need editor access to rename this document',
        )
      }
    }

    const filename = sanitizeFilename(dto.filename)
    document.rename(filename)
    const saved = await this.documentRepository.save(document)
    return { id: saved.id, filename: saved.getProps().filename } as any
  }
}

function sanitizeFilename(input: string): string {
  let name = input.replace(/[\\/]/g, '_').replace(/[\x00-\x1f"<>|*?]/g, '').trim()
  if (!name) name = `document_${Date.now()}`
  if (!/\.docx$/i.test(name)) name = `${name}.docx`
  if (name.length > 255) name = name.slice(0, 250) + '.docx'
  return name
}
