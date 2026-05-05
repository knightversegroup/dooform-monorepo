import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import 'multer'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { DocumentFormat } from '../../../domain/enums/document.enum'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'
import { Public } from '../../../../auth/interface/rest/decorators/public.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'
import { contentDisposition } from '../../../../../common/http/content-disposition'

@ApiTags('Documents')
@Controller('v1')
@UseFilters(HttpResultExceptionFilter)
export class DocumentController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Public()
  @Get('documents/health')
  @ApiOperation({ summary: 'Document service health check' })
  async healthCheck() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/health-check/health-check.use-case.module'),
      () => import('../../../application/use-cases/health-check/health-check.use-case'),
    )
    const result = await uc.execute({})
    return getResultValue(result)
  }

  @Post('templates/:id/process')
  @RequirePermission('documents:create')
  @ApiOperation({
    summary: 'Process a template with data to create a document',
    description: 'Send JSON body with data to use the stored template DOCX, or send multipart/form-data with a template file to override.',
  })
  @UseInterceptors(FileInterceptor('template'))
  async processDocument(
    @Param('id') templateId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: { data: string | Record<string, string>; filename?: string },
    @CurrentUser() user: UserContext,
  ) {
    // Parse data — JSON string (from multipart), object (from JSON body), or default to empty
    let data: Record<string, string>
    if (!body?.data) {
      data = {}
    } else if (typeof body.data === 'string') {
      try {
        data = JSON.parse(body.data)
      } catch {
        throw new BadRequestException('Invalid JSON in data field')
      }
    } else {
      data = body.data
    }

    const templateFile = file
      ? { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype, size: file.size }
      : undefined

    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/process-document/process-document.use-case.module'),
      () => import('../../../application/use-cases/process-document/process-document.use-case'),
    )
    const result = await uc.execute(
      {
        templateId,
        data,
        filename: typeof body?.filename === 'string' ? body.filename : undefined,
        userId: user.userId,
        userTier: user.userTier,
        organizationId: user.organizationId,
      },
      templateFile,
    )
    return getResultValue(result)
  }

  // NOTE: static `/documents/history` MUST be declared before `/documents/:id` so Nest
  // doesn't route a GET to /documents/history into the `:id` handler with id="history".
  @Get('documents/history')
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'Get document history for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'scope', required: false, enum: ['owned', 'shared', 'all'] })
  @ApiQuery({ name: 'lifecycleStatus', required: false })
  async getDocumentHistory(
    @Query('page') page: number | undefined,
    @Query('pageSize') pageSize: number | undefined,
    @Query('scope') scope: 'owned' | 'shared' | 'all' | undefined,
    @Query('lifecycleStatus') lifecycleStatus: string | string[] | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-document-history/get-document-history.use-case.module'),
      () => import('../../../application/use-cases/get-document-history/get-document-history.use-case'),
    )
    const lifecycleArray =
      typeof lifecycleStatus === 'string'
        ? lifecycleStatus.split(',').filter(Boolean)
        : lifecycleStatus
    const result = await uc.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      scope,
      lifecycleStatus: lifecycleArray,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get('documents/:id')
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'Get document metadata' })
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-document/get-document.use-case.module'),
      () => import('../../../application/use-cases/get-document/get-document.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get('documents/:id/preview.pdf')
  @RequirePermission('documents:read')
  @ApiOperation({
    summary: 'Inline PDF preview — streams the already-generated PDF (cached) for in-browser display',
  })
  async previewDocumentPdf(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/download-document/download-document.use-case.module'),
      () => import('../../../application/use-cases/download-document/download-document.use-case'),
    )
    // No watermarkPresetId — use the canonical cached PDF so the browser can cache it
    // across visits via ETag. The download use case already prefers the saved PDF and
    // only converts on-demand if neither finalized nor base PDF exists.
    const result = await uc.execute({
      documentId: id,
      format: DocumentFormat.PDF,
      userId: user.userId,
      userTier: user.userTier,
    })
    const value = getResultValue(result) as { buffer: Buffer; filename: string; mimeType: string }

    // Weak ETag based on byte length is enough for a single doc — content only changes
    // on regenerate, and that produces a new file the next request reads.
    const etag = `W/"${id}-${value.buffer.length}"`
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end()
      return
    }
    res.set({
      'Content-Type': value.mimeType,
      'Content-Disposition': contentDisposition('inline', value.filename),
      'Content-Length': value.buffer.length.toString(),
      'Cache-Control': 'private, max-age=3600',
      ETag: etag,
    })
    res.send(value.buffer)
  }

  @Get('documents/:id/download')
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'Download a document' })
  @ApiQuery({ name: 'format', enum: DocumentFormat, required: false })
  @ApiQuery({ name: 'watermark_preset_id', required: false })
  async downloadDocument(
    @Param('id') id: string,
    @Query('format') format: DocumentFormat | undefined,
    @Query('watermark_preset_id') watermarkPresetId: string | undefined,
    @CurrentUser() user: UserContext,
    @Res() res: Response,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/download-document/download-document.use-case.module'),
      () => import('../../../application/use-cases/download-document/download-document.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      format,
      watermarkPresetId,
      userId: user.userId,
      userTier: user.userTier,
    })

    const value = getResultValue(result) as { buffer: Buffer; filename: string; mimeType: string }

    res.set({
      'Content-Type': value.mimeType,
      'Content-Disposition': contentDisposition('attachment', value.filename),
      'Content-Length': value.buffer.length.toString(),
    })
    res.send(value.buffer)
  }

  @Delete('documents/:id')
  @RequirePermission('documents:delete')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-document/delete-document.use-case.module'),
      () => import('../../../application/use-cases/delete-document/delete-document.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Patch('documents/:id')
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Rename a document in place' })
  async renameDocument(
    @Param('id') id: string,
    @Body() body: { filename: string },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/rename-document/rename-document.use-case.module'),
      () => import('../../../application/use-cases/rename-document/rename-document.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      filename: body?.filename ?? '',
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post('regenerate/:id')
  @RequirePermission('documents:update')
  @ApiOperation({
    summary: 'Regenerate a document — optionally with overridden data + filename',
    description:
      'Spawns a new document from the same template. With no body it replays the source document\'s stored data. ' +
      'Pass `{ data, filename }` to override either or both — the source document is left untouched.',
  })
  async regenerateDocument(
    @Param('id') id: string,
    @Body() body: { data?: Record<string, string>; filename?: string } | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/regenerate-document/regenerate-document.use-case.module'),
      () => import('../../../application/use-cases/regenerate-document/regenerate-document.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      data: body?.data,
      filename: typeof body?.filename === 'string' ? body.filename : undefined,
      userId: user.userId,
      userTier: user.userTier,
      organizationId: user.organizationId,
    })
    return getResultValue(result)
  }

  @Post('documents/:id/regenerate')
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Regenerate a document (alternative endpoint)' })
  async regenerateDocumentAlt(
    @Param('id') id: string,
    @Body() body: { data?: Record<string, string>; filename?: string } | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/regenerate-document/regenerate-document.use-case.module'),
      () => import('../../../application/use-cases/regenerate-document/regenerate-document.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      data: body?.data,
      filename: typeof body?.filename === 'string' ? body.filename : undefined,
      userId: user.userId,
      userTier: user.userTier,
      organizationId: user.organizationId,
    })
    return getResultValue(result)
  }
}
