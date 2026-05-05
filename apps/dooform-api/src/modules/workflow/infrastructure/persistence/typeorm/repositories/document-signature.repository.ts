import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import {
  DocumentSignature,
  type DocumentSignatureProps,
} from '../../../../domain/entities/document-signature.entity'
import type { IDocumentSignatureRepository } from '../../../../domain/repositories/document-signature.repository'
import { DocumentSignatureModel } from '../models/document-signature.model'

@Injectable()
export class TypeOrmDocumentSignatureRepository
  extends BaseTypeOrmRepository<DocumentSignature, DocumentSignatureModel>
  implements IDocumentSignatureRepository
{
  constructor(
    @InjectRepository(DocumentSignatureModel)
    repository: Repository<DocumentSignatureModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DocumentSignatureModel)
  }

  async findByDocumentId(documentId: string): Promise<DocumentSignature[]> {
    const rows = await this.getRepository().find({
      where: { documentId },
      order: { signedAt: 'ASC' },
    })
    return rows.map((m) => this.toEntity(m))
  }

  async findById(id: string): Promise<DocumentSignature | null> {
    const row = await this.getRepository().findOne({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  protected toEntity(model: DocumentSignatureModel): DocumentSignature {
    const props: DocumentSignatureProps = {
      id: model.id,
      documentId: model.documentId,
      userId: model.userId,
      imagePath: model.imagePath,
      pageIndex: model.pageIndex,
      x: Number(model.x),
      y: Number(model.y),
      width: Number(model.width),
      height: Number(model.height),
      signedAt: model.signedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DocumentSignature as any)(props)
  }

  protected toModel(entity: DocumentSignature): Partial<DocumentSignatureModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      documentId: props.documentId,
      userId: props.userId,
      imagePath: props.imagePath,
      pageIndex: props.pageIndex,
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      signedAt: props.signedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
