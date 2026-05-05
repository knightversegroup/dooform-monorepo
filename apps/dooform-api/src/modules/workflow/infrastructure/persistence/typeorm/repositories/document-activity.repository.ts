import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DocumentActivity,
  type DocumentActivityProps,
} from '../../../../domain/entities/document-activity.entity'
import type { IDocumentActivityRepository } from '../../../../domain/repositories/document-activity.repository'
import { DocumentActivityModel } from '../models/document-activity.model'

@Injectable()
export class TypeOrmDocumentActivityRepository
  extends BaseTypeOrmRepository<DocumentActivity, DocumentActivityModel>
  implements IDocumentActivityRepository
{
  constructor(
    @InjectRepository(DocumentActivityModel)
    repository: Repository<DocumentActivityModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DocumentActivityModel)
  }

  async findByDocumentId(
    documentId: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: DocumentActivity[]; total: number }> {
    const [rows, total] = await this.getRepository().findAndCount({
      where: { documentId },
      order: { createdAt: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    })
    return { data: rows.map((m) => this.toEntity(m)), total }
  }

  protected toEntity(model: DocumentActivityModel): DocumentActivity {
    const props: DocumentActivityProps = {
      id: model.id,
      documentId: model.documentId,
      userId: model.userId,
      type: model.type,
      payload: model.payload ?? {},
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DocumentActivity as any)(props)
  }

  protected toModel(entity: DocumentActivity): Partial<DocumentActivityModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      documentId: props.documentId,
      userId: props.userId,
      type: props.type,
      payload: props.payload,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
