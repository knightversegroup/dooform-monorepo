import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Template, type TemplateProps } from '../../../../domain/entities/template.entity'
import type { ITemplateRepository } from '../../../../domain/repositories/template.repository'
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
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
