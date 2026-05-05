import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Res,
  UseFilters,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'
import type { Response } from 'express'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import type { AnnotationItem } from '../../../domain/entities/document-annotation.entity'
import { SaveAnnotationsBodyDto } from '../swagger/swagger-dtos'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'
import { contentDisposition } from '../../../../../common/http/content-disposition'

@ApiTags('Document Annotations')
@Controller('v1/documents')
@UseFilters(HttpResultExceptionFilter)
export class AnnotationController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get(':id/annotations')
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'Get annotations for a document' })
  async getAnnotations(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-annotations/get-annotations.use-case.module'),
      () => import('../../../application/use-cases/get-annotations/get-annotations.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Put(':id/annotations')
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Save/update annotations for a document' })
  @ApiBody({ type: SaveAnnotationsBodyDto })
  async saveAnnotations(
    @Param('id') id: string,
    @Body() body: { data: AnnotationItem[]; version: number },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/save-annotations/save-annotations.use-case.module'),
      () => import('../../../application/use-cases/save-annotations/save-annotations.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      data: body.data,
      version: body.version,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post(':id/finalize')
  @RequirePermission('documents:sign')
  @ApiOperation({ summary: 'Finalize annotations into PDF' })
  async finalizeDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/finalize-document/finalize-document.use-case.module'),
      () => import('../../../application/use-cases/finalize-document/finalize-document.use-case'),
    )
    const result = await uc.execute({
      documentId: id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get(':id/pdf-preview')
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'Stream base PDF for editor preview' })
  async getPdfPreview(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Res() res: Response,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-pdf-preview/get-pdf-preview.use-case.module'),
      () => import('../../../application/use-cases/get-pdf-preview/get-pdf-preview.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })

    const value = getResultValue(result) as { buffer: Buffer; filename: string }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition('inline', value.filename),
      'Content-Length': value.buffer.length.toString(),
    })
    res.send(value.buffer)
  }
}
