import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Document, type DocumentProps } from '../../../../domain/entities/document.entity'
import type { DocumentListOptions, IDocumentRepository } from '../../../../domain/repositories/document.repository'
import { DocumentLifecycleStatus } from '../../../../domain/enums/document.enum'
import { DocumentModel } from '../models/document.model'
import { DocumentShareModel } from '../../../../../workflow/infrastructure/persistence/typeorm/models/document-share.model'

@Injectable()
export class TypeOrmDocumentRepository
  extends BaseTypeOrmRepository<Document, DocumentModel>
  implements IDocumentRepository
{
  constructor(
    @InjectRepository(DocumentModel)
    repository: Repository<DocumentModel>,
    @InjectRepository(DocumentShareModel)
    private readonly sharesRepository: Repository<DocumentShareModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork
  ) {
    super(repository, unitOfWork, DocumentModel)
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number,
    options: DocumentListOptions = {},
  ): Promise<{ data: Document[]; total: number }> {
    const scope = options.scope ?? 'all'
    const lifecycleStatus = options.lifecycleStatus
    const lifecycleArray = Array.isArray(lifecycleStatus)
      ? lifecycleStatus
      : lifecycleStatus
        ? [lifecycleStatus]
        : null

    const qb = this.getRepository()
      .createQueryBuilder('doc')
      .orderBy('doc.createdAt', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)

    // A doc is "owned" if owner_user_id matches OR (legacy fallback) userId matches.
    // This way docs created before the schema migration (when owner_user_id defaulted
    // to '') still appear under their original creator.
    const ownedExpr =
      `(doc.owner_user_id = :userId OR doc.user_id = :userId)`
    // Subquery: skip soft-deleted shares (deleted_at IS NOT NULL means revoked).
    const sharedExpr =
      `doc.id IN (SELECT share.document_id FROM document_shares share WHERE share.user_id = :userId AND share.deleted_at IS NULL)`

    if (scope === 'owned') {
      qb.where(ownedExpr, { userId })
    } else if (scope === 'shared') {
      qb.where(`NOT ${ownedExpr} AND ${sharedExpr}`, { userId })
    } else {
      qb.where(`(${ownedExpr} OR ${sharedExpr})`, { userId })
    }

    if (lifecycleArray && lifecycleArray.length) {
      qb.andWhere('doc.lifecycle_status IN (:...statuses)', { statuses: lifecycleArray })
    }

    const [models, total] = await qb.getManyAndCount()

    return {
      data: models.map((model) => this.toEntity(model)),
      total,
    }
  }

  protected toEntity(model: DocumentModel): Document {
    const props: DocumentProps = {
      id: model.id,
      templateId: model.templateId,
      userId: model.userId,
      ownerUserId: model.ownerUserId || model.userId,
      organizationId: model.organizationId,
      filename: model.filename,
      filePathDocx: model.filePathDocx,
      filePathPdf: model.filePathPdf,
      filePathFinalizedPdf: model.filePathFinalizedPdf,
      data: model.data,
      status: model.status,
      lifecycleStatus: model.lifecycleStatus ?? DocumentLifecycleStatus.DRAFT,
      fileSize: model.fileSize,
      mimeType: model.mimeType,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (Document as any)(props)
  }

  protected toModel(entity: Document): Partial<DocumentModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      templateId: props.templateId,
      userId: props.userId,
      ownerUserId: props.ownerUserId ?? props.userId,
      organizationId: props.organizationId ?? null,
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf,
      filePathFinalizedPdf: props.filePathFinalizedPdf,
      data: props.data,
      status: props.status,
      lifecycleStatus: props.lifecycleStatus ?? DocumentLifecycleStatus.DRAFT,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}

// Re-export so the In() helper isn't tree-shaken; satisfies tsc with the new branches.
export const _typeormHelpers = { In }

