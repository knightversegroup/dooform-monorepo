import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IUnitOfWork } from '@dooform-api-core/application'
import { UNIT_OF_WORK_TOKEN, BaseTypeOrmRepository } from '@dooform-api-core/infrastructure/persistence/typeorm'

import { Statistics, type StatisticsProps } from '../../../../domain/entities/statistics.entity'
import { EventType } from '../../../../domain/enums/analytics.enum'
import type {
  IStatisticsRepository,
  StatisticsSummary,
  TemplateStatistics,
  TimeSeriesData,
  TimeSeriesPoint,
} from '../../../../domain/repositories/statistics.repository'
import { StatisticsModel } from '../models/statistics.model'

@Injectable()
export class TypeOrmStatisticsRepository
  extends BaseTypeOrmRepository<Statistics, StatisticsModel>
  implements IStatisticsRepository
{
  constructor(
    @InjectRepository(StatisticsModel)
    repository: Repository<StatisticsModel>,
    @Inject(UNIT_OF_WORK_TOKEN)
    unitOfWork: IUnitOfWork,
  ) {
    super(repository, unitOfWork, StatisticsModel)
  }

  protected toEntity(model: StatisticsModel): Statistics {
    const props: StatisticsProps = {
      id: model.id,
      eventType: model.eventType,
      templateId: model.templateId,
      date: model.date!,
      count: Number(model.count),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }
    return new (Statistics as any)(props)
  }

  protected toModel(entity: Statistics): Partial<StatisticsModel> {
    const props = entity.getProps()
    return {
      id: entity.id,
      eventType: props.eventType,
      templateId: props.templateId,
      date: props.date,
      count: props.count,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    }
  }

  async incrementStat(
    eventType: EventType,
    templateId: string | null,
  ): Promise<void> {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const qb = this.repository
      .createQueryBuilder()
      .where('event_type = :eventType', { eventType })
      .andWhere('date = :date', { date: today.toISOString().split('T')[0] })

    if (templateId) {
      qb.andWhere('template_id = :templateId', { templateId })
    } else {
      qb.andWhere('template_id IS NULL')
    }

    const existing = await qb.getOne()

    if (existing) {
      await this.repository
        .createQueryBuilder()
        .update()
        .set({ count: () => 'count + 1' })
        .where('id = :id', { id: existing.id })
        .execute()
    } else {
      const stat = this.repository.create({
        eventType,
        templateId: templateId || null,
        date: today,
        count: 1,
      })
      await this.repository.save(stat)
    }
  }

  async getSummary(): Promise<StatisticsSummary> {
    const rows = await this.repository
      .createQueryBuilder('s')
      .select('s.event_type', 'eventType')
      .addSelect('COALESCE(SUM(s.count), 0)', 'total')
      .where('s.template_id IS NULL')
      .groupBy('s.event_type')
      .getRawMany()

    const summary: StatisticsSummary = {
      totalFormSubmits: 0,
      totalExports: 0,
      totalDownloads: 0,
    }

    for (const row of rows) {
      const total = Number(row.total)
      switch (row.eventType) {
        case EventType.FORM_SUBMIT:
          summary.totalFormSubmits = total
          break
        case EventType.EXPORT:
          summary.totalExports = total
          break
        case EventType.DOWNLOAD:
          summary.totalDownloads = total
          break
      }
    }

    return summary
  }

  async getTemplateStats(): Promise<TemplateStatistics[]> {
    const rows = await this.repository
      .createQueryBuilder('s')
      .select('s.template_id', 'templateId')
      .addSelect('s.event_type', 'eventType')
      .addSelect('COALESCE(SUM(s.count), 0)', 'total')
      .where('s.template_id IS NOT NULL')
      .groupBy('s.template_id')
      .addGroupBy('s.event_type')
      .getRawMany()

    const map = new Map<string, TemplateStatistics>()

    for (const row of rows) {
      if (!map.has(row.templateId)) {
        map.set(row.templateId, {
          templateId: row.templateId,
          formSubmits: 0,
          exports: 0,
          downloads: 0,
        })
      }

      const stat = map.get(row.templateId)!
      const total = Number(row.total)

      switch (row.eventType) {
        case EventType.FORM_SUBMIT:
          stat.formSubmits = total
          break
        case EventType.EXPORT:
          stat.exports = total
          break
        case EventType.DOWNLOAD:
          stat.downloads = total
          break
      }
    }

    return Array.from(map.values())
  }

  async getStatsByTemplate(
    templateId: string,
  ): Promise<TemplateStatistics | null> {
    const rows = await this.repository
      .createQueryBuilder('s')
      .select('s.event_type', 'eventType')
      .addSelect('COALESCE(SUM(s.count), 0)', 'total')
      .where('s.template_id = :templateId', { templateId })
      .groupBy('s.event_type')
      .getRawMany()

    if (rows.length === 0) return null

    const stat: TemplateStatistics = {
      templateId,
      formSubmits: 0,
      exports: 0,
      downloads: 0,
    }

    for (const row of rows) {
      const total = Number(row.total)
      switch (row.eventType) {
        case EventType.FORM_SUBMIT:
          stat.formSubmits = total
          break
        case EventType.EXPORT:
          stat.exports = total
          break
        case EventType.DOWNLOAD:
          stat.downloads = total
          break
      }
    }

    return stat
  }

  async getTimeSeries(
    eventType: EventType,
    days: number,
    templateId?: string,
  ): Promise<TimeSeriesData> {
    const startDate = new Date()
    startDate.setUTCHours(0, 0, 0, 0)
    startDate.setUTCDate(startDate.getUTCDate() - days)

    const qb = this.repository
      .createQueryBuilder('s')
      .select('s.date', 'date')
      .addSelect('COALESCE(SUM(s.count), 0)', 'count')
      .where('s.event_type = :eventType', { eventType })
      .andWhere('s.date >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })

    if (templateId) {
      qb.andWhere('s.template_id = :templateId', { templateId })
    } else {
      qb.andWhere('s.template_id IS NULL')
    }

    const rows = await qb
      .groupBy('s.date')
      .orderBy('s.date', 'ASC')
      .getRawMany()

    let total = 0
    const dataPoints: TimeSeriesPoint[] = rows.map((row) => {
      const count = Number(row.count)
      total += count
      return {
        date:
          row.date instanceof Date
            ? row.date.toISOString().split('T')[0]
            : String(row.date),
        count,
      }
    })

    return {
      eventType,
      dataPoints,
      total,
    }
  }

  async getTrends(
    days: number,
    templateId?: string,
  ): Promise<Record<string, TimeSeriesData>> {
    const result: Record<string, TimeSeriesData> = {}

    for (const eventType of Object.values(EventType)) {
      result[eventType] = await this.getTimeSeries(
        eventType,
        days,
        templateId,
      )
    }

    return result
  }
}
