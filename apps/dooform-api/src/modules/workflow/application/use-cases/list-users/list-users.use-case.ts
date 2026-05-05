import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserModel } from '../../../infrastructure/persistence/typeorm/models/user.model'

export interface ListUsersInput {
  // The caller's organizationId. The list is hard-scoped to this tenant; users from
  // other organizations (and platform-wide GLOBAL_ADMIN accounts living in the system
  // org) are never returned here. The share dialog uses this to ensure documents can
  // only be shared inside the org.
  organizationId: string | null
}

interface ListUsersResult {
  data: Array<{
    id: string
    email: string
    displayName: string
    avatarUrl: string | null | undefined
    createdAt: Date | undefined
  }>
}

@Injectable()
@UseClassLogger('workflow')
export class ListUsersUseCase implements UseCase<ListUsersInput, ListUsersResult> {
  constructor(
    @Inject('IUserRepository')
    private readonly users: IUserRepository,
    @InjectRepository(UserModel)
    private readonly usersRepo: Repository<UserModel>,
  ) {}

  @UseResult()
  async execute(input: ListUsersInput): Promise<Result<ListUsersResult>> {
    // No org context → caller can't share with anyone.
    if (!input?.organizationId) return { data: [] } as any

    const rows = await this.usersRepo.find({
      where: { organizationId: input.organizationId },
      order: { displayName: 'ASC' },
    })

    return {
      data: rows.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
      })),
    } as any
  }
}
