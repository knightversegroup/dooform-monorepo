import { randomUUID } from 'crypto'

import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DocumentShare,
  type DocumentShareProps,
} from '../../../../domain/entities/document-share.entity'
import type { IDocumentShareRepository } from '../../../../domain/repositories/document-share.repository'
import { DocumentShareModel } from '../models/document-share.model'

@Injectable()
export class TypeOrmDocumentShareRepository
  extends BaseTypeOrmRepository<DocumentShare, DocumentShareModel>
  implements IDocumentShareRepository
{
  constructor(
    @InjectRepository(DocumentShareModel)
    repository: Repository<DocumentShareModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DocumentShareModel)
  }

  async findByDocumentId(documentId: string): Promise<DocumentShare[]> {
    const rows = await this.getRepository().find({
      where: { documentId },
      order: { createdAt: 'ASC' },
    })
    return rows.map((m) => this.toEntity(m))
  }

  async findByDocumentAndUser(
    documentId: string,
    userId: string,
  ): Promise<DocumentShare | null> {
    const row = await this.getRepository().findOne({ where: { documentId, userId } })
    return row ? this.toEntity(row) : null
  }

  async findById(id: string): Promise<DocumentShare | null> {
    const row = await this.getRepository().findOne({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async restoreOrCreate(input: {
    documentId: string
    userId: string
    role: string
    grantedBy: string
  }): Promise<{ id: string; documentId: string; userId: string; role: string; restored: boolean }> {
    // Look up including soft-deleted rows. The unique index `(document_id, user_id)`
    // does not consider deleted_at, so we must reuse the existing row when re-sharing
    // with a previously-revoked user — otherwise INSERT fails with the unique violation.
    const existing = await this.getRepository().findOne({
      where: { documentId: input.documentId, userId: input.userId },
      withDeleted: true,
    })

    if (existing) {
      existing.role = input.role as DocumentShareModel['role']
      existing.grantedBy = input.grantedBy
      existing.deletedAt = null
      const saved = await this.getRepository().save(existing)
      return {
        id: saved.id,
        documentId: saved.documentId,
        userId: saved.userId,
        role: saved.role,
        restored: true,
      }
    }

    const created = this.getRepository().create({
      id: randomUUID(),
      documentId: input.documentId,
      userId: input.userId,
      role: input.role as DocumentShareModel['role'],
      grantedBy: input.grantedBy,
      deletedAt: null,
    })
    const saved = await this.getRepository().save(created)
    return {
      id: saved.id,
      documentId: saved.documentId,
      userId: saved.userId,
      role: saved.role,
      restored: false,
    }
  }

  protected toEntity(model: DocumentShareModel): DocumentShare {
    const props: DocumentShareProps = {
      id: model.id,
      documentId: model.documentId,
      userId: model.userId,
      role: model.role,
      grantedBy: model.grantedBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DocumentShare as any)(props)
  }

  protected toModel(entity: DocumentShare): Partial<DocumentShareModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      documentId: props.documentId,
      userId: props.userId,
      role: props.role,
      grantedBy: props.grantedBy,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
