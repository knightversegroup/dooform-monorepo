import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { ShareRole } from '../../../domain/enums/workflow.enum'
import type { IDocumentSignatureRepository } from '../../../domain/repositories/document-signature.repository'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface DeleteDocumentSignatureDto {
  documentId: string
  signatureId: string
  actorUserId: string
}

@Injectable()
@UseClassLogger('workflow')
export class DeleteDocumentSignatureUseCase
  implements UseCase<DeleteDocumentSignatureDto, { ok: true }>
{
  constructor(
    @Inject('IDocumentSignatureRepository')
    private readonly signatures: IDocumentSignatureRepository,
    private readonly access: DocumentAccessService,
  ) {}

  @UseResult()
  async execute(
    dto: DeleteDocumentSignatureDto,
  ): Promise<Result<{ ok: true }>> {
    const summary = await this.access.require(
      dto.documentId,
      dto.actorUserId,
      ShareRole.EDITOR,
    )
    const sig = await this.signatures.findById(dto.signatureId)
    if (!sig || sig.documentId !== dto.documentId) {
      throw new NotFoundException('Signature not found')
    }
    if (sig.userId !== dto.actorUserId && !summary.isOwner) {
      throw new BadRequestException(
        'Only the signer or owner can remove a signature',
      )
    }
    await this.signatures.deleteById(sig.id)
    return { ok: true } as any
  }
}
