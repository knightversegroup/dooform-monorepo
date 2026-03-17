import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { ActivityLog, type ActivityLogProps } from '../../../../domain/entities/activity-log.entity'
import type {
  IActivityLogRepository,
  PaginatedResult,
  LogStats,
} from '../../../../domain/repositories/activity-log.repository'
import { ActivityLogModel } from '../models/activity-log.model'

@Injectable()
export class TypeOrmActivityLogRepository
  extends BaseTypeOrmRepository<ActivityLog, ActivityLogModel>
  implements IActivityLogRepository
{
  constructor(
    @InjectRepository(ActivityLogModel)
    repository: Repository<ActivityLogModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, ActivityLogModel)
  }

  protected toEntity(model: ActivityLogModel): ActivityLog {
    const props: ActivityLogProps = {
      id: model.id,
      method: model.method,
      path: model.path,
      userAgent: model.userAgent,
      ipAddress: model.ipAddress,
      requestBody: model.requestBody,
      queryParams: model.queryParams,
      statusCode: model.statusCode,
      responseTime: Number(model.responseTime),
      userId: model.userId,
      userEmail: model.userEmail,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (ActivityLog as any)(props)
  }

  protected toModel(entity: ActivityLog): Partial<ActivityLogModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
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
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }

  async findPaginated(
    limit: number,
    offset: number,
    filters?: { method?: string; path?: string; userId?: string },
  ): Promise<PaginatedResult<ActivityLog>> {
    const qb = this.repository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')

    if (filters?.method) {
      qb.andWhere('UPPER(log.method) = :method', {
        method: filters.method.toUpperCase(),
      })
    }

    if (filters?.path) {
      qb.andWhere('log.path LIKE :path', { path: `%${filters.path}%` })
    }

    if (filters?.userId) {
      qb.andWhere('log.user_id = :userId', { userId: filters.userId })
    }

    const [models, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount()

    return {
      data: models.map((m) => this.toEntity(m)),
      total,
    }
  }

  async getLogStats(): Promise<LogStats> {
    const methodCounts: Record<string, number> = {}
    const pathCounts: Record<string, number> = {}
    const statusCodeCounts: Record<string, number> = {}

    const methodRows = await this.repository
      .createQueryBuilder('log')
      .select('log.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.method')
      .getRawMany()

    for (const row of methodRows) {
      methodCounts[row.method] = Number(row.count)
    }

    const pathRows = await this.repository
      .createQueryBuilder('log')
      .select('log.path', 'path')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.path')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany()

    for (const row of pathRows) {
      pathCounts[row.path] = Number(row.count)
    }

    const statusRows = await this.repository
      .createQueryBuilder('log')
      .select('log.status_code', 'statusCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.status_code')
      .getRawMany()

    for (const row of statusRows) {
      statusCodeCounts[String(row.statusCode)] = Number(row.count)
    }

    const totalResult = await this.repository.count()

    return {
      methodCounts,
      pathCounts,
      statusCodeCounts,
      totalLogs: totalResult,
    }
  }

  async findProcessLogs(limit: number): Promise<ActivityLog[]> {
    const models = await this.repository
      .createQueryBuilder('log')
      .where('log.method = :method', { method: 'POST' })
      .andWhere('log.path LIKE :path', { path: '%/process%' })
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .getMany()

    return models.map((m) => this.toEntity(m))
  }

  async findHistory(limit: number): Promise<ActivityLog[]> {
    const models = await this.repository
      .createQueryBuilder('log')
      .where('log.method = :method', { method: 'POST' })
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .getMany()

    return models.map((m) => this.toEntity(m))
  }
}
