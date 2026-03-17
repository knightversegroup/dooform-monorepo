import type { IRepository } from '@dooform-api-core/domain'

import type { EventType } from '../enums/analytics.enum'
import type { Statistics } from '../entities/statistics.entity'

export interface StatisticsSummary {
  totalFormSubmits: number
  totalExports: number
  totalDownloads: number
}

export interface TemplateStatistics {
  templateId: string
  formSubmits: number
  exports: number
  downloads: number
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface TimeSeriesData {
  eventType: string
  dataPoints: TimeSeriesPoint[]
  total: number
}

export interface IStatisticsRepository extends IRepository<Statistics> {
  incrementStat(eventType: EventType, templateId: string | null): Promise<void>

  getSummary(): Promise<StatisticsSummary>

  getTemplateStats(): Promise<TemplateStatistics[]>

  getStatsByTemplate(templateId: string): Promise<TemplateStatistics | null>

  getTimeSeries(
    eventType: EventType,
    days: number,
    templateId?: string,
  ): Promise<TimeSeriesData>

  getTrends(
    days: number,
    templateId?: string,
  ): Promise<Record<string, TimeSeriesData>>
}
