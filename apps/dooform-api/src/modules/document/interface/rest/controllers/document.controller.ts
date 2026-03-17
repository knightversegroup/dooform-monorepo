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
  ForbiddenException,
} from '@nestjs/common'
import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { CurrentUser, type RequestUser } from '../../../../../common/decorators/current-user.decorator'
import { RequireQuota } from '../../../../../common/decorators/require-quota.decorator'

import { ProcessTemplateUseCase } from '../../../application/use-cases/process-template/process-template.use-case'
import { GetDocumentUseCase } from '../../../application/use-cases/get-document/get-document.use-case'
import { DownloadDocumentUseCase } from '../../../application/use-cases/download-document/download-document.use-case'
import { DeleteDocumentUseCase } from '../../../application/use-cases/delete-document/delete-document.use-case'
import { RegenerateDocumentUseCase } from '../../../application/use-cases/regenerate-document/regenerate-document.use-case'
import { GetDocumentHistoryUseCase } from '../../../application/use-cases/get-document-history/get-document-history.use-case'

@Controller()
@UseFilters(HttpResultExceptionFilter)
export class DocumentController {
  constructor(
    private readonly processTemplateUseCase: ProcessTemplateUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly downloadDocumentUseCase: DownloadDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly regenerateDocumentUseCase: RegenerateDocumentUseCase,
    private readonly getDocumentHistoryUseCase: GetDocumentHistoryUseCase,
  ) {}

  @RequireQuota()
  @Post('templates/:id/process')
  async processTemplate(
    @Param('id') templateId: string,
    @Body() body: { data: Record<string, string> },
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.processTemplateUseCase.execute({
      templateId,
      data: body.data,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get('documents/history')
  async getDocumentHistory(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.getDocumentHistoryUseCase.execute({
      userId: user.userId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })
    return getResultValue(result)
  }

  @Get('documents/:id')
  async getDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.getDocumentUseCase.execute({ id })
    const value = getResultValue(result) as any
    // Ownership check: only owner or admin can view
    if (value?.userId && value.userId !== user.userId && !user.roles?.includes('admin')) {
      throw new ForbiddenException('You do not have access to this document')
    }
    return value
  }

  @Get('documents/:id/download')
  async downloadDocument(
    @Param('id') id: string,
    @Query('format') format: string,
    @CurrentUser() user: RequestUser,
    @Res() res: any,
  ) {
    const result = await this.downloadDocumentUseCase.execute({
      id,
      format: format || 'docx',
      userId: user.userId,
    })
    const value = getResultValue(result) as any

    res.set({
      'Content-Type': value.mimeType,
      'Content-Disposition': `attachment; filename="${value.filename}"`,
    })
    res.send(value.buffer)
  }

  @Post('documents/:id/regenerate')
  async regenerateDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.regenerateDocumentUseCase.execute({ id, userId: user.userId })
    return getResultValue(result)
  }

  @Delete('documents/:id')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    // Verify ownership before deleting
    const doc = await this.getDocumentUseCase.execute({ id })
    const docValue = getResultValue(doc) as any
    if (docValue?.userId && docValue.userId !== user.userId && !user.roles?.includes('admin')) {
      throw new ForbiddenException('You do not have access to this document')
    }
    const result = await this.deleteDocumentUseCase.execute({ id })
    return getResultValue(result)
  }
}
