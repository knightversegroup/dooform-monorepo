import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Template, type TemplateProps } from '../../../../domain/entities/template.entity'
import { TemplateVisibility } from '../../../../domain/enums/template.enum'
import type {
  ITemplateRepository,
  ListTemplatesForOrgOptions,
} from '../../../../domain/repositories/template.repository'
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

  async findByDocumentTypeId(documentTypeId: string): Promise<Template[]> {
    const models = await this.getRepository().find({
      where: { documentTypeId },
      order: { variantOrder: 'ASC', createdAt: 'DESC' },
    })
    return models.map((m) => this.toEntity(m))
  }

  async findVisibleToOrg(
    options: ListTemplatesForOrgOptions,
  ): Promise<{ data: Template[]; total: number }> {
    const qb = this.getRepository().createQueryBuilder('t')

    const isGlobalAdmin = options.callerRole === 'GLOBAL_ADMIN'
    const isOrgAdmin = options.callerRole === 'ORG_ADMIN'

    // Public marketing site: only true GLOBAL + PUBLISHED rows. No legacy fallback —
    // an org-scoped template must never leak out, even if it was uploaded with a
    // null organizationId by an old code path.
    if (options.publicOnly) {
      qb.where('(t.visibility = :global AND t.status = :pub)', {
        global: TemplateVisibility.GLOBAL,
        pub: 'PUBLISHED',
      })
    } else if (isGlobalAdmin) {
      // Visibility / status rules:
      //  - GLOBAL_ADMIN: sees everything (org filter still applies if org code requested it).
      //  - ORG_ADMIN of org X: sees own-org rows (any status) + (GLOBAL or legacy) rows that are PUBLISHED.
      //  - USER: sees PUBLISHED rows in own-org or (GLOBAL or legacy).
      if (options.organizationId) {
        qb.where(
          '(t.organization_id = :orgId OR t.visibility = :global OR t.organization_id IS NULL)',
          { orgId: options.organizationId, global: TemplateVisibility.GLOBAL },
        )
      } else {
        qb.where('1=1')
      }
    } else if (isOrgAdmin && options.organizationId) {
      qb.where(
        '(t.organization_id = :orgId OR ((t.visibility = :global OR t.organization_id IS NULL) AND t.status = :pub))',
        { orgId: options.organizationId, global: TemplateVisibility.GLOBAL, pub: 'PUBLISHED' },
      )
    } else if (options.organizationId) {
      // Regular USER with an org.
      qb.where(
        '((t.organization_id = :orgId OR t.visibility = :global OR t.organization_id IS NULL) AND t.status = :pub)',
        { orgId: options.organizationId, global: TemplateVisibility.GLOBAL, pub: 'PUBLISHED' },
      )
    } else {
      // No org context: only PUBLISHED globals/legacy.
      qb.where('((t.visibility = :global OR t.organization_id IS NULL) AND t.status = :pub)', {
        global: TemplateVisibility.GLOBAL,
        pub: 'PUBLISHED',
      })
    }

    if (options.status) qb.andWhere('t.status = :status', { status: options.status })
    if (options.type) qb.andWhere('t.type = :type', { type: options.type })
    if (options.tier) qb.andWhere('t.tier = :tier', { tier: options.tier })
    else if (options.tiers && options.tiers.length)
      qb.andWhere('t.tier IN (:...tiers)', { tiers: options.tiers })
    if (options.category) qb.andWhere('t.category = :category', { category: options.category })
    if (options.documentTypeId)
      qb.andWhere('t.document_type_id = :dtId', { dtId: options.documentTypeId })
    if (options.search) {
      qb.andWhere(
        '(t.name ILIKE :s OR COALESCE(t.display_name, \'\') ILIKE :s OR COALESCE(t.description, \'\') ILIKE :s)',
        { s: `%${options.search}%` },
      )
    }

    qb.orderBy('t.created_at', 'DESC')
      .skip(options.page * options.pageSize)
      .take(options.pageSize)

    const [models, total] = await qb.getManyAndCount()
    return { data: models.map((m) => this.toEntity(m)), total }
  }

  protected toEntity(model: TemplateModel): Template {
    const props: TemplateProps = {
      id: model.id,
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      author: model.author,
      status: model.status,
      type: model.type,
      tier: model.tier,
      category: model.category,
      filePath: model.filePath,
      originalFilename: model.originalFilename,
      filePathHTML: model.filePathHTML,
      filePathPDF: model.filePathPDF,
      filePathThumbnail: model.filePathThumbnail,
      filePathThumbnailSm: model.filePathThumbnailSm,
      fileSize: model.fileSize,
      mimeType: model.mimeType,
      placeholders: model.placeholders,
      aliases: model.aliases,
      fieldDefinitions: model.fieldDefinitions,
      originalSource: model.originalSource,
      remarks: model.remarks,
      isVerified: model.isVerified,
      isAIAvailable: model.isAIAvailable,
      group: model.group,
      documentTypeId: model.documentTypeId,
      variantName: model.variantName,
      variantOrder: model.variantOrder,
      pageOrientation: model.pageOrientation,
      organizationId: model.organizationId,
      ownerUserId: model.ownerUserId,
      visibility: model.visibility,
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
      name: props.name,
      displayName: props.displayName,
      description: props.description,
      author: props.author,
      status: props.status,
      type: props.type,
      tier: props.tier,
      category: props.category,
      filePath: props.filePath,
      originalFilename: props.originalFilename,
      filePathHTML: props.filePathHTML,
      filePathPDF: props.filePathPDF,
      filePathThumbnail: props.filePathThumbnail,
      filePathThumbnailSm: props.filePathThumbnailSm,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
      placeholders: props.placeholders,
      aliases: props.aliases,
      fieldDefinitions: props.fieldDefinitions,
      originalSource: props.originalSource,
      remarks: props.remarks,
      isVerified: props.isVerified,
      isAIAvailable: props.isAIAvailable,
      group: props.group,
      documentTypeId: props.documentTypeId,
      variantName: props.variantName,
      variantOrder: props.variantOrder,
      pageOrientation: props.pageOrientation,
      organizationId: props.organizationId ?? null,
      ownerUserId: props.ownerUserId ?? null,
      visibility: props.visibility,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
