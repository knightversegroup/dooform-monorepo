import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository'
import { GetLogsDto } from '../../dtos/get-logs.dto'

interface ActivityLogItem {
  id: string
  method: string
  path: string
  userAgent: string
  ipAddress: string
  requestBody: string | null
  queryParams: string | null
  statusCode: number
  responseTime: number
  userId: string | null
  userEmail: string | null
  createdAt: Date
}

interface GetLogsResult {
  data: ActivityLogItem[]
  total: number
  page: number
  limit: number
}

@Injectable()
@UseClassLogger('analytics')
export class GetLogsUseCase implements UseCase<GetLogsDto, GetLogsResult> {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  @UseResult()
  async execute(dto: GetLogsDto): Promise<Result<GetLogsResult>> {
    const limit = dto.limit ?? 50
    const page = dto.page ?? 1
    const offset = (page - 1) * limit

    const { data, total } = await this.activityLogRepository.findPaginated(
      limit,
      offset,
      {
        method: dto.method,
        path: dto.path,
        userId: dto.userId,
      },
    )

    return {
      data: data.map((log) => {
        const props = log.getProps()
        return {
          id: log.id,
          method: props.method,
          path: props.path,
          userAgent: props.userAgent,
          ipAddress: props.ipAddress,
          requestBody: props.requestBody,
          queryParams: props.queryParams,
          statusCode: props.statusCode,
          responseTime: props.responseTime,
          userId: props.userId,
          userEmail: props.userEmail,
          createdAt: props.createdAt!,
        }
      }),
      total,
      page,
      limit,
    } as any
  }
}
