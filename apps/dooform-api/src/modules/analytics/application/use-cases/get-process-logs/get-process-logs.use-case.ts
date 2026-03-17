import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository'

interface ProcessLogItem {
  id: string
  method: string
  path: string
  statusCode: number
  responseTime: number
  userId: string | null
  userEmail: string | null
  createdAt: Date
}

@Injectable()
@UseClassLogger('analytics')
export class GetProcessLogsUseCase implements UseCase<Record<string, never>, ProcessLogItem[]> {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  @UseResult()
  async execute(_dto: Record<string, never>): Promise<Result<ProcessLogItem[]>> {
    const logs = await this.activityLogRepository.findProcessLogs(100)

    return logs.map((log) => {
      const props = log.getProps()
      return {
        id: log.id,
        method: props.method,
        path: props.path,
        statusCode: props.statusCode,
        responseTime: props.responseTime,
        userId: props.userId,
        userEmail: props.userEmail,
        createdAt: props.createdAt!,
      }
    }) as any
  }
}
