import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import type { PaginatedResult } from '@dooform-api-core/domain'
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

  protected toEntity(model: DocumentModel): Document {
    const props: DocumentProps = {
      id: model.id,
      templateId: model.templateId ?? '',
      userId: model.userId,
      filename: model.filename,
      filePathDocx: model.filePathDocx,
      filePathPdf: model.filePathPdf,
      fileSize: Number(model.fileSize),
      mimeType: model.mimeType,
      data: model.data,
      status: model.status,
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
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      data: props.data,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }

  async updatePdfPath(id: string, filePathPdf: string): Promise<void> {
    await this.getRepository().update(id, { filePathPdf } as any)
  }

  async findByUserIdPaginated(userId: string, page: number, limit: number): Promise<PaginatedResult<Document>> {
    const offset = (page - 1) * limit

    const [models, total] = await this.getRepository().findAndCount({
      where: { userId } as any,
      order: { createdAt: 'DESC' } as any,
      skip: offset,
      take: limit,
    })

    return {
      data: models.map((model) => this.toEntity(model)),
      total,
      page,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    }
  }
}
