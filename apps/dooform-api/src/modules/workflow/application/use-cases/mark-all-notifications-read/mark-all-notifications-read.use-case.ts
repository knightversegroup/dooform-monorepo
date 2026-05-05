import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { INotificationRepository } from '../../../domain/repositories/notification.repository'

export interface MarkAllNotificationsReadDto {
  userId: string
}

@Injectable()
@UseClassLogger('workflow')
export class MarkAllNotificationsReadUseCase
  implements UseCase<MarkAllNotificationsReadDto, { ok: true }>
{
  constructor(
    @Inject('INotificationRepository')
    private readonly notifications: INotificationRepository,
  ) {}

  @UseResult()
  async execute(
    dto: MarkAllNotificationsReadDto,
  ): Promise<Result<{ ok: true }>> {
    await this.notifications.markAllRead(dto.userId)
    return { ok: true } as any
  }
}
