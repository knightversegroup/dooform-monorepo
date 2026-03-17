import type { IRepository } from '@dooform-api-core/domain'

import type { ActivityLog } from '../entities/activity-log.entity'

export interface PaginatedResult<T> {
  data: T[]
  total: number
}

export interface LogStats {
  methodCounts: Record<string, number>
  pathCounts: Record<string, number>
  statusCodeCounts: Record<string, number>
  totalLogs: number
}

export interface IActivityLogRepository extends IRepository<ActivityLog> {
  findPaginated(
    limit: number,
    offset: number,
    filters?: { method?: string; path?: string; userId?: string },
  ): Promise<PaginatedResult<ActivityLog>>

  getLogStats(): Promise<LogStats>

  findProcessLogs(limit: number): Promise<ActivityLog[]>

  findHistory(limit: number): Promise<ActivityLog[]>
}
