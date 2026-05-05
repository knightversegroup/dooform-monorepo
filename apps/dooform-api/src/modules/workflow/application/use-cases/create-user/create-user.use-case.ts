import { ConflictException, Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { User } from '../../../domain/entities/user.entity'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

export interface CreateUserDto {
  email: string
  displayName: string
  avatarUrl?: string | null
}

interface CreateUserResult {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null | undefined
  createdAt: Date | undefined
}

@Injectable()
@UseClassLogger('workflow')
export class CreateUserUseCase implements UseCase<CreateUserDto, CreateUserResult> {
  constructor(
    @Inject('IUserRepository')
    private readonly users: IUserRepository,
  ) {}

  @UseResult()
  async execute(dto: CreateUserDto): Promise<Result<CreateUserResult>> {
    const existing = await this.users.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException(`A user with email ${dto.email} already exists`)
    }
    const user = User.create({
      email: dto.email,
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl ?? null,
    })
    const saved = await this.users.save(user)
    const props = saved.getProps()
    return {
      id: saved.id,
      email: props.email,
      displayName: props.displayName,
      avatarUrl: props.avatarUrl,
      createdAt: props.createdAt,
    } as any
  }
}
