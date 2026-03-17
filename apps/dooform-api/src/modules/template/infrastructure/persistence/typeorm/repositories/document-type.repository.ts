import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { DocumentType, type DocumentTypeProps } from '../../../../domain/entities/document-type.entity'
import type { IDocumentTypeRepository } from '../../../../domain/repositories/document-type.repository'
import { DocumentTypeModel } from '../models/document-type.model'
import { TemplateModel } from '../models/template.model'

@Injectable()
export class TypeOrmDocumentTypeRepository
  extends BaseTypeOrmRepository<DocumentType, DocumentTypeModel>
  implements IDocumentTypeRepository
{
  constructor(
    @InjectRepository(DocumentTypeModel)
    repository: Repository<DocumentTypeModel>,
    @InjectRepository(TemplateModel)
    private readonly templateRepository: Repository<TemplateModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork
  ) {
    super(repository, unitOfWork, DocumentTypeModel)
  }

  protected toEntity(model: DocumentTypeModel): DocumentType {
    const props: DocumentTypeProps = {
      id: model.id,
      code: model.code,
      name: model.name,
      nameEn: model.nameEn ?? '',
      description: model.description ?? '',
      originalSource: model.originalSource ?? '',
      category: model.category ?? '',
      icon: model.icon ?? '',
      color: model.color ?? '',
      sortOrder: model.sortOrder ?? 0,
      isActive: model.isActive ?? true,
      metadata: typeof model.metadata === 'string' ? model.metadata : JSON.stringify(model.metadata ?? {}),
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
      nameEn: props.nameEn,
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

  async findByCode(code: string): Promise<DocumentType | null> {
    const model = await this.getRepository().findOne({ where: { code } as any })
    return model ? this.toEntity(model) : null
  }

  async findAll(category?: string, activeOnly?: boolean): Promise<DocumentType[]> {
    const qb = this.getRepository().createQueryBuilder('dt')
    qb.where('dt.deleted_at IS NULL')

    if (activeOnly) {
      qb.andWhere('dt.is_active = :isActive', { isActive: true })
    }
    if (category) {
      qb.andWhere('dt.category = :category', { category })
    }

    qb.orderBy('dt.sort_order', 'ASC').addOrderBy('dt.name', 'ASC')

    const models = await qb.getMany()
    return models.map((model) => this.toEntity(model))
  }

  async countTemplatesByDocumentTypeId(documentTypeId: string): Promise<number> {
    return this.templateRepository.count({
      where: { documentTypeId } as any,
    })
  }
}
