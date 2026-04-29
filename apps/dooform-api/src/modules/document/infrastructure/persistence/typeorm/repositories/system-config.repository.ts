import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { SystemConfig, type SystemConfigProps } from '../../../../domain/entities/system-config.entity'
import type { ISystemConfigRepository } from '../../../../domain/repositories/system-config.repository'
import { SystemConfigModel } from '../models/system-config.model'

@Injectable()
export class TypeOrmSystemConfigRepository implements ISystemConfigRepository {
  constructor(
    @InjectRepository(SystemConfigModel)
    private readonly repository: Repository<SystemConfigModel>,
  ) {}

  async findByKey(key: string): Promise<SystemConfig | null> {
    const model = await this.repository.findOne({ where: { key } })
    return model ? this.toEntity(model) : null
  }

  async save(entity: SystemConfig): Promise<SystemConfig> {
    const modelData = this.toModel(entity)
    const saved = await this.repository.save(modelData)
    return this.toEntity(saved)
  }

  async deleteByKey(key: string): Promise<void> {
    await this.repository.delete({ key })
  }

  private toEntity(model: SystemConfigModel): SystemConfig {
    const props: SystemConfigProps = {
      id: model.key,
      key: model.key,
      value: model.value,
      updatedBy: model.updatedBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }
    return new (SystemConfig as any)(props)
  }

  private toModel(entity: SystemConfig): Partial<SystemConfigModel> {
    const props = entity.getProps()
    return {
      key: props.key,
      value: props.value,
      updatedBy: props.updatedBy,
    }
  }
}
