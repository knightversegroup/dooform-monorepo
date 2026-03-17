import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Template, type TemplateProps } from '../../../../domain/entities/template.entity'
import type { ITemplateRepository, TemplateFilter } from '../../../../domain/repositories/template.repository'
import { TemplateModel } from '../models/template.model'

@Injectable()
export class TypeOrmTemplateRepository
  extends BaseTypeOrmRepository<Template, TemplateModel>
  implements ITemplateRepository
{
  constructor(
    @InjectRepository(TemplateModel)
    repository: Repository<TemplateModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork
  ) {
    super(repository, unitOfWork, TemplateModel)
  }

  protected toEntity(model: TemplateModel): Template {
    const props: TemplateProps = {
      id: model.id,
      filename: model.filename ?? '',
      originalName: model.originalName ?? '',
      displayName: model.displayName ?? '',
      name: model.name ?? '',
      description: model.description,
      author: model.author ?? '',
      category: model.category as any,
      filePathDocx: model.filePathDocx ?? '',
      filePathHtml: model.filePathHtml ?? '',
      filePathPdf: model.filePathPdf ?? '',
      filePathThumbnail: model.filePathThumbnail ?? '',
      fileSize: Number(model.fileSize) || 0,
      mimeType: model.mimeType ?? '',
      placeholders: typeof model.placeholders === 'string' ? model.placeholders : JSON.stringify(model.placeholders ?? []),
      aliases: typeof model.aliases === 'string' ? model.aliases : JSON.stringify(model.aliases ?? {}),
      fieldDefinitions: typeof model.fieldDefinitions === 'string' ? model.fieldDefinitions : JSON.stringify(model.fieldDefinitions ?? {}),
      originalSource: model.originalSource ?? '',
      remarks: model.remarks ?? '',
      isVerified: model.isVerified ?? false,
      isAIAvailable: model.isAIAvailable ?? false,
      status: model.status,
      type: model.type,
      tier: model.tier,
      group: model.group ?? '',
      documentTypeId: model.documentTypeId ?? null,
      variantName: model.variantName ?? '',
      variantOrder: model.variantOrder ?? 0,
      pageOrientation: model.pageOrientation,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (Template as any)(props)
  }

  protected toModel(entity: Template): Partial<TemplateModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      filename: props.filename,
      originalName: props.originalName,
      displayName: props.displayName,
      name: props.name,
      description: props.description,
      author: props.author,
      category: props.category,
      filePathDocx: props.filePathDocx,
      filePathHtml: props.filePathHtml,
      filePathPdf: props.filePathPdf,
      filePathThumbnail: props.filePathThumbnail,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      placeholders: props.placeholders,
      aliases: props.aliases,
      fieldDefinitions: props.fieldDefinitions,
      originalSource: props.originalSource,
      remarks: props.remarks,
      isVerified: props.isVerified,
      isAIAvailable: props.isAIAvailable,
      status: props.status,
      type: props.type,
      tier: props.tier,
      group: props.group,
      documentTypeId: props.documentTypeId,
      variantName: props.variantName,
      variantOrder: props.variantOrder,
      pageOrientation: props.pageOrientation,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }

  async findWithFilter(filter: TemplateFilter): Promise<Template[]> {
    const repo = this.getRepository()
    const qb = repo.createQueryBuilder('t')

    if (filter.documentTypeId) {
      qb.andWhere('t.document_type_id = :documentTypeId', { documentTypeId: filter.documentTypeId })
    }
    if (filter.type) {
      qb.andWhere('t.type = :type', { type: filter.type })
    }
    if (filter.tier) {
      qb.andWhere('t.tier = :tier', { tier: filter.tier })
    }
    if (filter.category) {
      qb.andWhere('t.category = :category', { category: filter.category })
    }
    if (filter.isVerified !== undefined) {
      qb.andWhere('t.is_verified = :isVerified', { isVerified: filter.isVerified })
    }
    if (filter.search) {
      const searchPattern = `%${filter.search}%`
      qb.andWhere(
        '(t.display_name ILIKE :search OR t.description ILIKE :search OR t.author ILIKE :search)',
        { search: searchPattern },
      )
    }

    // Soft delete filter
    qb.andWhere('t.deleted_at IS NULL')

    if (filter.includeDocumentType) {
      qb.leftJoinAndSelect('t.documentType', 'dt')
    }

    switch (filter.sort) {
      case 'popular':
      case 'recent':
        qb.orderBy('t.created_at', 'DESC')
        break
      case 'name':
        qb.orderBy("COALESCE(NULLIF(t.display_name, ''), t.filename)", 'ASC')
        break
      default:
        qb.orderBy('t.document_type_id', 'ASC')
          .addOrderBy('t.variant_order', 'ASC')
          .addOrderBy('t.created_at', 'DESC')
        break
    }

    if (filter.limit && filter.limit > 0) {
      qb.limit(filter.limit)
    }

    const models = await qb.getMany()
    return models.map((model) => this.toEntity(model))
  }

  async findGroupedByDocumentType(): Promise<{ documentTypeId: string | null; templates: Template[] }[]> {
    const repo = this.getRepository()
    const models = await repo
      .createQueryBuilder('t')
      .where('t.deleted_at IS NULL')
      .orderBy('t.document_type_id', 'ASC')
      .addOrderBy('t.variant_order', 'ASC')
      .addOrderBy('t.created_at', 'DESC')
      .getMany()

    const groups = new Map<string | null, Template[]>()
    for (const model of models) {
      const key = model.documentTypeId ?? null
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(this.toEntity(model))
    }

    return Array.from(groups.entries()).map(([documentTypeId, templates]) => ({
      documentTypeId,
      templates,
    }))
  }

  async findOrphanTemplates(): Promise<Template[]> {
    const repo = this.getRepository()
    const models = await repo
      .createQueryBuilder('t')
      .where('(t.document_type_id IS NULL OR t.document_type_id = :empty)', { empty: '' })
      .andWhere('t.deleted_at IS NULL')
      .orderBy('t.created_at', 'DESC')
      .getMany()

    return models.map((model) => this.toEntity(model))
  }
}
