import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository'

interface HistoryItem {
  id: string
  method: string
  path: string
  requestBody: string | null
  statusCode: number
  responseTime: number
  userId: string | null
  userEmail: string | null
  createdAt: Date
}

@Injectable()
@UseClassLogger('analytics')
export class GetHistoryUseCase implements UseCase<Record<string, never>, HistoryItem[]> {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<HistoryItem[]>> {
    const logs = await this.activityLogRepository.findHistory(100)

    return logs.map((log) => {
      const props = log.getProps()
      return {
        id: log.id,
        method: props.method,
        path: props.path,
        requestBody: props.requestBody,
        statusCode: props.statusCode,
        responseTime: props.responseTime,
        userId: props.userId,
        userEmail: props.userEmail,
        createdAt: props.createdAt!,
      }
    }) as any
  }
}
