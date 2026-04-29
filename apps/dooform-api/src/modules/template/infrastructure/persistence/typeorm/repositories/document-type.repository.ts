import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentType, type DocumentTypeProps } from '../../../../domain/entities/document-type.entity'
import type { IDocumentTypeRepository } from '../../../../domain/repositories/document-type.repository'
import { DocumentTypeModel } from '../models/document-type.model'

@Injectable()
export class TypeOrmDocumentTypeRepository
  extends BaseTypeOrmRepository<DocumentType, DocumentTypeModel>
  implements IDocumentTypeRepository
{
  constructor(
    @InjectRepository(DocumentTypeModel)
    repository: Repository<DocumentTypeModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, DocumentTypeModel)
  }

  async findByCode(code: string): Promise<DocumentType | null> {
    const model = await this.getRepository().findOne({ where: { code } })
    return model ? this.toEntity(model) : null
  }

  async findByCategory(category: string): Promise<DocumentType[]> {
    const models = await this.getRepository().find({
      where: { category },
      order: { sortOrder: 'ASC' },
    })
    return models.map((m) => this.toEntity(m))
  }

  async findDistinctCategories(): Promise<string[]> {
    const result = await this.getRepository()
      .createQueryBuilder('dt')
      .select('DISTINCT dt.category', 'category')
      .where('dt.category IS NOT NULL')
      .andWhere('dt.deleted_at IS NULL')
      .orderBy('dt.category', 'ASC')
      .getRawMany()
    return result.map((r: any) => r.category)
  }

  protected toEntity(model: DocumentTypeModel): DocumentType {
    const props: DocumentTypeProps = {
      id: model.id,
      code: model.code,
      name: model.name,
      nameEN: model.nameEN,
      description: model.description,
      originalSource: model.originalSource,
      category: model.category,
      icon: model.icon,
      color: model.color,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
      metadata: model.metadata,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (DocumentType as any)(props)
  }

  protected toModel(entity: DocumentType): Partial<DocumentTypeModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      code: props.code,
      name: props.name,
      nameEN: props.nameEN,
      description: props.description,
      originalSource: props.originalSource,
      category: props.category,
      icon: props.icon,
      color: props.color,
      sortOrder: props.sortOrder,
      isActive: props.isActive,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
