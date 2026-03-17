import { Inject, Injectable } from '@nestjs/common'

import type { IActivityLogService } from '../../../../common/interceptors/activity-logging.interceptor'
import { ActivityLog } from '../../domain/entities/activity-log.entity'
import type { IActivityLogRepository } from '../../domain/repositories/activity-log.repository'

@Injectable()
export class ActivityLoggingService implements IActivityLogService {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
  ) {}

  logActivity(data: {
    userId?: string | null
    userEmail?: string | null
    method: string
    path: string
    statusCode: number
    responseTime: number
    userAgent?: string
    ipAddress?: string
    requestBody?: string | null
    queryParams?: string | null
  }): void {
    const log = ActivityLog.create({
      method: data.method,
      path: data.path,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      requestBody: data.requestBody,
      queryParams: data.queryParams,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      userId: data.userId,
      userEmail: data.userEmail,
    })

    // Fire-and-forget — don't let logging failures affect requests
    this.activityLogRepository.save(log).catch(() => {})
  }
}
