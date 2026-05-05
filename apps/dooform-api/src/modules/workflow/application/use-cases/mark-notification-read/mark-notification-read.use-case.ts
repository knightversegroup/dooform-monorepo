import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseClassLogger, UseResult } from '@dooform-api-core/shared/decorators'

import type { INotificationRepository } from '../../../domain/repositories/notification.repository'

export interface MarkNotificationReadDto {
  userId: string
  notificationId: string
}

@Injectable()
@UseClassLogger('workflow')
export class MarkNotificationReadUseCase
  implements UseCase<MarkNotificationReadDto, { ok: true }>
{
  constructor(
    @Inject('INotificationRepository')
    private readonly notifications: INotificationRepository,
  ) {}

  @UseResult()
  async execute(dto: MarkNotificationReadDto): Promise<Result<{ ok: true }>> {
    await this.notifications.markRead(dto.userId, [dto.notificationId])
    return { ok: true } as any
  }
}
