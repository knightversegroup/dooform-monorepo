import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import { UserTier } from '../../../../document/domain/enums/document.enum'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

export interface GetCurrentUserDto {
  userId: string
  userTier: UserTier
  watermarkDisabled: boolean
}

interface GetCurrentUserResult {
  userId: string
  userTier: UserTier
  watermarkDisabled: boolean
  profile: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null | undefined
  } | null
}

@Injectable()
@UseClassLogger('workflow')
export class GetCurrentUserUseCase
  implements UseCase<GetCurrentUserDto, GetCurrentUserResult>
{
  constructor(
    @Inject('IUserRepository')
    private readonly users: IUserRepository,
  ) {}

  @UseResult()
  async execute(dto: GetCurrentUserDto): Promise<Result<GetCurrentUserResult>> {
    const profileEntity = dto.userId ? await this.users.findById(dto.userId) : null
    return {
      userId: dto.userId,
      userTier: dto.userTier,
      watermarkDisabled: dto.watermarkDisabled,
      profile: profileEntity
        ? {
            id: profileEntity.id,
            email: profileEntity.email,
            displayName: profileEntity.displayName,
            avatarUrl: profileEntity.avatarUrl,
          }
        : null,
    } as any
  }
}
