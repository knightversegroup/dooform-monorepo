import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Document, type DocumentProps } from '../../../../domain/entities/document.entity'
import type { IDocumentRepository } from '../../../../domain/repositories/document.repository'
import { DocumentModel } from '../models/document.model'

@Injectable()
export class TypeOrmDocumentRepository
  extends BaseTypeOrmRepository<Document, DocumentModel>
  implements IDocumentRepository
{
  constructor(
    @InjectRepository(DocumentModel)
    repository: Repository<DocumentModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork
  ) {
    super(repository, unitOfWork, DocumentModel)
  }

  async findByUserId(userId: string, page: number, pageSize: number): Promise<{ data: Document[]; total: number }> {
    const [models, total] = await this.getRepository().findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    })

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
      filename: model.filename,
      filePathDocx: model.filePathDocx,
      filePathPdf: model.filePathPdf,
      filePathFinalizedPdf: model.filePathFinalizedPdf,
      data: model.data,
      status: model.status,
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
      filename: props.filename,
      filePathDocx: props.filePathDocx,
      filePathPdf: props.filePathPdf,
      filePathFinalizedPdf: props.filePathFinalizedPdf,
      data: props.data,
      status: props.status,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
