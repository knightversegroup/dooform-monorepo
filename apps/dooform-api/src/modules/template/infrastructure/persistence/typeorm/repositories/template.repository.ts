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

  protected toEntity(model: TemplateModel): Template {
    const props: TemplateProps = {
      id: model.id,
      name: model.name,
      description: model.description,
      status: model.status,
      type: model.type,
      tier: model.tier,
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
      description: props.description,
      status: props.status,
      type: props.type,
      tier: props.tier,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
