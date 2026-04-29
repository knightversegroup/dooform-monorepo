import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import 'multer'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { DocumentFormat } from '../../../domain/enums/document.enum'
import { ProcessDocumentUseCase } from '../../../application/use-cases/process-document/process-document.use-case'
import { GetDocumentUseCase } from '../../../application/use-cases/get-document/get-document.use-case'
import { DownloadDocumentUseCase } from '../../../application/use-cases/download-document/download-document.use-case'
import { DeleteDocumentUseCase } from '../../../application/use-cases/delete-document/delete-document.use-case'
import { GetDocumentHistoryUseCase } from '../../../application/use-cases/get-document-history/get-document-history.use-case'
import { RegenerateDocumentUseCase } from '../../../application/use-cases/regenerate-document/regenerate-document.use-case'
import { HealthCheckUseCase } from '../../../application/use-cases/health-check/health-check.use-case'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'

@ApiTags('Documents')
@Controller('v1')
@UseFilters(HttpResultExceptionFilter)
export class DocumentController {
  constructor(
    private readonly processDocumentUseCase: ProcessDocumentUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly downloadDocumentUseCase: DownloadDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly getDocumentHistoryUseCase: GetDocumentHistoryUseCase,
    private readonly regenerateDocumentUseCase: RegenerateDocumentUseCase,
    private readonly healthCheckUseCase: HealthCheckUseCase,
  ) {}

  @Get('documents/health')
  @ApiOperation({ summary: 'Document service health check' })
  async healthCheck() {
    const result = await this.healthCheckUseCase.execute({})
    return getResultValue(result)
  }

  @Post('templates/:id/process')
  @ApiOperation({
    summary: 'Process a template with data to create a document',
    description: 'Send JSON body with data to use the stored template DOCX, or send multipart/form-data with a template file to override.',
  })
  @UseInterceptors(FileInterceptor('template'))
  async processDocument(
    @Param('id') templateId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: { data: string | Record<string, string> },
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

    const result = await this.processDocumentUseCase.execute(
      {
        templateId,
        data,
        userId: user.userId,
        userTier: user.userTier,
      },
      templateFile,
    )
    return getResultValue(result)
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document metadata' })
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.getDocumentUseCase.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get('documents/:id/download')
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
    const result = await this.downloadDocumentUseCase.execute({
      documentId: id,
      format,
      watermarkPresetId,
      userId: user.userId,
      userTier: user.userTier,
    })

    const value = getResultValue(result) as { buffer: Buffer; filename: string; mimeType: string }

    res.set({
      'Content-Type': value.mimeType,
      'Content-Disposition': `attachment; filename="${value.filename}"`,
      'Content-Length': value.buffer.length.toString(),
    })
    res.send(value.buffer)
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.deleteDocumentUseCase.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get('documents/history')
  @ApiOperation({ summary: 'Get document history for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getDocumentHistory(
    @Query('page') page: number | undefined,
    @Query('pageSize') pageSize: number | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.getDocumentHistoryUseCase.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post('regenerate/:id')
  @ApiOperation({ summary: 'Regenerate a document from stored data' })
  async regenerateDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.regenerateDocumentUseCase.execute({
      documentId: id,
      userId: user.userId,
      userTier: user.userTier,
    })
    return getResultValue(result)
  }

  @Post('documents/:id/regenerate')
  @ApiOperation({ summary: 'Regenerate a document (alternative endpoint)' })
  async regenerateDocumentAlt(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.regenerateDocumentUseCase.execute({
      documentId: id,
      userId: user.userId,
      userTier: user.userTier,
    })
    return getResultValue(result)
  }
}
