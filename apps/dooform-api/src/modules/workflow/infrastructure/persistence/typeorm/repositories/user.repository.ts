import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import {
  BaseTypeOrmRepository,
  UNIT_OF_WORK_TOKEN,
} from '@dooform-api-core/infrastructure/persistence/typeorm'

import { User, type UserProps } from '../../../../domain/entities/user.entity'
import type { IUserRepository } from '../../../../domain/repositories/user.repository'
import { UserModel } from '../models/user.model'

@Injectable()
export class TypeOrmUserRepository
  extends BaseTypeOrmRepository<User, UserModel>
  implements IUserRepository
{
  constructor(
    @InjectRepository(UserModel)
    repository: Repository<UserModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, UserModel)
  }

  async findAll(): Promise<User[]> {
    const rows = await this.getRepository().find({ order: { displayName: 'ASC' } })
    return rows.map((m) => this.toEntity(m))
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.getRepository().findOne({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.getRepository().findOne({ where: { email } })
    return row ? this.toEntity(row) : null
  }

  protected toEntity(model: UserModel): User {
    const props: UserProps = {
      id: model.id,
      email: model.email,
      displayName: model.displayName,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (User as any)(props)
  }

  protected toModel(entity: User): Partial<UserModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      email: props.email,
      displayName: props.displayName,
      avatarUrl: props.avatarUrl ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }
}
