import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { WatermarkPreset, type WatermarkPresetProps } from '../../../../domain/entities/watermark-preset.entity'
import type { IWatermarkPresetRepository } from '../../../../domain/repositories/watermark-preset.repository'
import { WatermarkPresetModel } from '../models/watermark-preset.model'

@Injectable()
export class TypeOrmWatermarkPresetRepository
  extends BaseTypeOrmRepository<WatermarkPreset, WatermarkPresetModel>
  implements IWatermarkPresetRepository
{
  constructor(
    @InjectRepository(WatermarkPresetModel)
    repository: Repository<WatermarkPresetModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, WatermarkPresetModel)
  }

  async findByUserId(userId: string): Promise<WatermarkPreset[]> {
    const models = await this.getRepository().find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
    return models.map((m) => this.toEntity(m))
  }

  protected toEntity(model: WatermarkPresetModel): WatermarkPreset {
    const props: WatermarkPresetProps = {
      id: model.id,
      userId: model.userId,
      name: model.name,
      config: model.config,
      logoPath: model.logoPath,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (WatermarkPreset as any)(props)
  }

  protected toModel(entity: WatermarkPreset): Partial<WatermarkPresetModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      userId: props.userId,
      name: props.name,
      config: props.config,
      logoPath: props.logoPath,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
