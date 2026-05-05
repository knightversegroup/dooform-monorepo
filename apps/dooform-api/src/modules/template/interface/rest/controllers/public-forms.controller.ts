import { Controller, Get, Param, Query, Res, UseFilters } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'
import type { Response } from 'express'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { Public } from '../../../../auth/interface/rest/decorators/public.decorator'
import { SkipAudit } from '../../../../auth/interface/rest/decorators/audit.decorators'

/**
 * Public, unauthenticated read-only endpoints intended for the marketing/sales site.
 * Only PUBLISHED templates with `visibility = GLOBAL` are exposed, and the response
 * payload is intentionally trimmed — no organizationId, ownerUserId, file paths, or
 * other internals leak out.
 */
@ApiTags('Public / Forms')
@Controller('public/forms')
@UseFilters(HttpResultExceptionFilter)
@Public()
@SkipAudit()
export class PublicFormsController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @ApiOperation({ summary: 'List published global form templates (public)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listForms(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case.module'),
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case'),
    )
    const result = await uc.execute({
      organizationId: null,
      // Strict public mode — repository forces visibility=GLOBAL + status=PUBLISHED.
      // Org-scoped templates can never leak through this endpoint, even legacy rows
      // that may have organizationId=NULL.
      publicOnly: true,
      status: 'PUBLISHED',
      category,
      search,
      page: page ? Number(page) : 0,
      pageSize: pageSize ? Math.min(Number(pageSize), 50) : 20,
    })
    const value = getResultValue(result) as { data?: any[]; total?: number; page?: number; pageSize?: number }
    return {
      data: (value.data ?? []).map(stripPublicFields),
      total: value.total ?? 0,
      page: value.page ?? 0,
      pageSize: value.pageSize ?? 0,
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate counts for the marketing site' })
  async stats() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case.module'),
      () => import('../../../application/use-cases/get-all-templates/get-all-templates.use-case'),
    )
    const result = await uc.execute({
      organizationId: null,
      publicOnly: true,
      status: 'PUBLISHED',
      page: 0,
      pageSize: 1,
    })
    const value = getResultValue(result) as { total?: number }
    return { totalForms: value.total ?? 0 }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single published global form template (public)' })
  async getForm(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'),
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case'),
    )
    // No callerRole → access policy treats this as anonymous and returns 404 for
    // any non-PUBLISHED or non-GLOBAL template.
    const result = await uc.execute({ id })
    const value = getResultValue(result)
    return stripPublicFields(value)
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get the thumbnail image for a public template' })
  async getThumbnail(@Param('id') id: string, @Res() res: Response) {
    // Gate on the access policy first — anonymous callers only see PUBLISHED + GLOBAL.
    // If the template doesn't qualify, get-template-by-id throws and we return 404.
    const guard = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case.module'),
      () => import('../../../application/use-cases/get-template-by-id/get-template-by-id.use-case'),
    )
    await guard.execute({ id })

    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case.module'),
      () => import('../../../application/use-cases/get-template-thumbnail/get-template-thumbnail.use-case'),
    )
    const value = getResultValue(await uc.execute({ id })) as { buffer: Buffer; filename: string }
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
      'Content-Length': value.buffer.length.toString(),
    })
    res.send(value.buffer)
  }
}

function stripPublicFields(t: any) {
  if (!t) return t
  return {
    id: t.id,
    name: t.name,
    displayName: t.displayName,
    description: t.description,
    author: t.author,
    type: t.type,
    tier: t.tier,
    category: t.category,
    pageOrientation: t.pageOrientation,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}
