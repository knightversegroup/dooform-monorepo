import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { ShareRole } from '../../../domain/enums/workflow.enum'
import type { IDocumentActivityRepository } from '../../../domain/repositories/document-activity.repository'
import { DocumentAccessService } from '../../../domain/services/document-access.service'

export interface ListDocumentActivitiesDto {
  documentId: string
  actorUserId: string
  page?: number
  pageSize?: number
}

interface ListDocumentActivitiesResult {
  data: Array<{
    id: string
    type: string
    userId: string
    payload: Record<string, unknown>
    createdAt: Date | undefined
  }>
  total: number
  page: number
  pageSize: number
}

@Injectable()
@UseClassLogger('workflow')
export class ListDocumentActivitiesUseCase
  implements UseCase<ListDocumentActivitiesDto, ListDocumentActivitiesResult>
{
  constructor(
    @Inject('IDocumentActivityRepository')
    private readonly activities: IDocumentActivityRepository,
    private readonly access: DocumentAccessService,
  ) {}

  @UseResult()
  async execute(
    dto: ListDocumentActivitiesDto,
  ): Promise<Result<ListDocumentActivitiesResult>> {
    await this.access.require(dto.documentId, dto.actorUserId, ShareRole.VIEWER)
    const page = dto.page ?? 0
    const pageSize = dto.pageSize ?? 50
    const { data, total } = await this.activities.findByDocumentId(
      dto.documentId,
      page,
      pageSize,
    )
    return {
      data: data.map((a) => {
        const p = a.getProps()
        return {
          id: a.id,
          type: p.type,
          userId: p.userId,
          payload: p.payload,
          createdAt: p.createdAt,
        }
      }),
      total,
      page,
      pageSize,
    } as any
  }
}
