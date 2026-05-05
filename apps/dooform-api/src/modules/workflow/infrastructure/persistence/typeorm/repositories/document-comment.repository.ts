import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DocumentComment,
  type DocumentCommentProps,
} from '../../../../domain/entities/document-comment.entity'
import type { IDocumentCommentRepository } from '../../../../domain/repositories/document-comment.repository'
import { DocumentCommentModel } from '../models/document-comment.model'

@Injectable()
export class TypeOrmDocumentCommentRepository
  extends BaseTypeOrmRepository<DocumentComment, DocumentCommentModel>
  implements IDocumentCommentRepository
{
  constructor(
    @InjectRepository(DocumentCommentModel)
    repository: Repository<DocumentCommentModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DocumentCommentModel)
  }

  async findByDocumentId(documentId: string): Promise<DocumentComment[]> {
    const rows = await this.getRepository().find({
      where: { documentId },
      order: { createdAt: 'ASC' },
    })
    return rows.map((m) => this.toEntity(m))
  }

  async findById(id: string): Promise<DocumentComment | null> {
    const row = await this.getRepository().findOne({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  protected toEntity(model: DocumentCommentModel): DocumentComment {
    const props: DocumentCommentProps = {
      id: model.id,
      documentId: model.documentId,
      userId: model.userId,
      body: model.body,
      parentId: model.parentId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DocumentComment as any)(props)
  }

  protected toModel(entity: DocumentComment): Partial<DocumentCommentModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      documentId: props.documentId,
      userId: props.userId,
      body: props.body,
      parentId: props.parentId ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
