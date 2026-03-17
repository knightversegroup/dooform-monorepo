import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseFilters,
} from '@nestjs/common'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { GetLogsUseCase } from '../../../application/use-cases/get-logs/get-logs.use-case'
import { GetLogStatsUseCase } from '../../../application/use-cases/get-log-stats/get-log-stats.use-case'
import { GetProcessLogsUseCase } from '../../../application/use-cases/get-process-logs/get-process-logs.use-case'
import { GetHistoryUseCase } from '../../../application/use-cases/get-history/get-history.use-case'
import { IngestEventUseCase } from '../../../application/use-cases/ingest-event/ingest-event.use-case'
import { GetStatsUseCase } from '../../../application/use-cases/get-stats/get-stats.use-case'
import { GetStatsSummaryUseCase } from '../../../application/use-cases/get-stats-summary/get-stats-summary.use-case'
import { GetTemplateStatsUseCase } from '../../../application/use-cases/get-template-stats/get-template-stats.use-case'
import {
  GetTrendsUseCase,
  GetTimeSeriesUseCase,
} from '../../../application/use-cases/get-trends/get-trends.use-case'
import { RecordEventUseCase } from '../../../application/use-cases/record-event/record-event.use-case'
import type { GetLogsDto } from '../../../application/dtos/get-logs.dto'
import type { RecordEventDto } from '../../../application/dtos/record-event.dto'
import type { EventType } from '../../../domain/enums/analytics.enum'

@Controller()
@UseFilters(HttpResultExceptionFilter)
export class AnalyticsController {
  constructor(
    private readonly getLogsUseCase: GetLogsUseCase,
    private readonly getLogStatsUseCase: GetLogStatsUseCase,
    private readonly getProcessLogsUseCase: GetProcessLogsUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    private readonly ingestEventUseCase: IngestEventUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly getStatsSummaryUseCase: GetStatsSummaryUseCase,
    private readonly getTemplateStatsUseCase: GetTemplateStatsUseCase,
    private readonly getTrendsUseCase: GetTrendsUseCase,
    private readonly getTimeSeriesUseCase: GetTimeSeriesUseCase,
    private readonly recordEventUseCase: RecordEventUseCase,
  ) {}

  // --- Activity Logs ---

  @Get('logs')
  async getLogs(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
    @Query('userId') userId?: string,
  ) {
    const dto: GetLogsDto = {
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      method,
      path,
      userId,
    }
    const result = await this.getLogsUseCase.execute(dto)
    return getResultValue(result)
  }

  @Get('logs/stats')
  async getLogStats() {
    const result = await this.getLogStatsUseCase.execute({})
    return getResultValue(result)
  }

  @Get('logs/process')
  async getProcessLogs() {
    const result = await this.getProcessLogsUseCase.execute({})
    return getResultValue(result)
  }

  @Get('history')
  async getHistory() {
    const result = await this.getHistoryUseCase.execute({})
    return getResultValue(result)
  }

  @Post('events')
  async ingestEvent(@Body() body: RecordEventDto) {
    const result = await this.ingestEventUseCase.execute(body)
    return getResultValue(result)
  }

  // --- Statistics ---

  @Get('stats')
  async getStats(
    @Query('days') days?: string,
    @Query('template_id') templateId?: string,
  ) {
    const result = await this.getStatsUseCase.execute({
      days: days ? Number(days) : undefined,
      templateId,
    })
    return getResultValue(result)
  }

  @Get('stats/summary')
  async getStatsSummary() {
    const result = await this.getStatsSummaryUseCase.execute({})
    return getResultValue(result)
  }

  @Get('stats/templates')
  async getTemplateStats() {
    const result = await this.getTemplateStatsUseCase.execute({})
    return getResultValue(result)
  }

  @Get('stats/templates/:templateId')
  async getStatsByTemplate(@Param('templateId') templateId: string) {
    const result = await this.getTemplateStatsUseCase.execute({ templateId })
    return getResultValue(result)
  }

  @Get('stats/trends')
  async getTrends(
    @Query('days') days?: string,
    @Query('template_id') templateId?: string,
  ) {
    const result = await this.getTrendsUseCase.execute({
      days: days ? Number(days) : undefined,
      templateId,
    })
    return getResultValue(result)
  }

  @Get('stats/trends/:eventType')
  async getTimeSeries(
    @Param('eventType') eventType: EventType,
    @Query('days') days?: string,
    @Query('template_id') templateId?: string,
  ) {
    const result = await this.getTimeSeriesUseCase.execute({
      eventType,
      days: days ? Number(days) : undefined,
      templateId,
    })
    return getResultValue(result)
  }

  @Post('stats/record')
  async recordEvent(@Body() body: RecordEventDto) {
    const result = await this.recordEventUseCase.execute(body)
    return getResultValue(result)
  }
}
