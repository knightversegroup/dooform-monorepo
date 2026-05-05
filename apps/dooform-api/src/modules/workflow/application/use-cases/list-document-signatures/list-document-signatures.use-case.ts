import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { ShareRole } from '../../../domain/enums/workflow.enum'
import type { IDocumentSignatureRepository } from '../../../domain/repositories/document-signature.repository'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface ListDocumentSignaturesDto {
  documentId: string
  actorUserId: string
}

interface ListDocumentSignaturesResult {
  data: Array<{
    id: string
    userId: string
    pageIndex: number
    x: number
    y: number
    width: number
    height: number
    imagePath: string
    signedAt: Date
  }>
}

@Injectable()
@UseClassLogger('workflow')
export class ListDocumentSignaturesUseCase
  implements UseCase<ListDocumentSignaturesDto, ListDocumentSignaturesResult>
{
  constructor(
    @Inject('IDocumentSignatureRepository')
    private readonly signatures: IDocumentSignatureRepository,
    private readonly access: DocumentAccessService,
  ) {}

  @UseResult()
  async execute(
    dto: ListDocumentSignaturesDto,
  ): Promise<Result<ListDocumentSignaturesResult>> {
    await this.access.require(dto.documentId, dto.actorUserId, ShareRole.VIEWER)
    const rows = await this.signatures.findByDocumentId(dto.documentId)
    return {
      data: rows.map((s) => {
        const p = s.getProps()
        return {
          id: s.id,
          userId: p.userId,
          pageIndex: p.pageIndex,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          imagePath: p.imagePath,
          signedAt: p.signedAt,
        }
      }),
    } as any
  }
}
