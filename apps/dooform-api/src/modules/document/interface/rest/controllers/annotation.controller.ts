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
import type { Response } from 'express'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { GetAnnotationsUseCase } from '../../../application/use-cases/get-annotations/get-annotations.use-case'
import { SaveAnnotationsUseCase } from '../../../application/use-cases/save-annotations/save-annotations.use-case'
import { FinalizeDocumentUseCase } from '../../../application/use-cases/finalize-document/finalize-document.use-case'
import { GetPdfPreviewUseCase } from '../../../application/use-cases/get-pdf-preview/get-pdf-preview.use-case'
import type { AnnotationItem } from '../../../domain/entities/document-annotation.entity'
import { SaveAnnotationsBodyDto } from '../swagger/swagger-dtos'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'

@ApiTags('Document Annotations')
@Controller('v1/documents')
@UseFilters(HttpResultExceptionFilter)
export class AnnotationController {
  constructor(
    private readonly getAnnotationsUseCase: GetAnnotationsUseCase,
    private readonly saveAnnotationsUseCase: SaveAnnotationsUseCase,
    private readonly finalizeDocumentUseCase: FinalizeDocumentUseCase,
    private readonly getPdfPreviewUseCase: GetPdfPreviewUseCase,
  ) {}

  @Get(':id/annotations')
  @ApiOperation({ summary: 'Get annotations for a document' })
  async getAnnotations(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.getAnnotationsUseCase.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Put(':id/annotations')
  @ApiOperation({ summary: 'Save/update annotations for a document' })
  @ApiBody({ type: SaveAnnotationsBodyDto })
  async saveAnnotations(
    @Param('id') id: string,
    @Body() body: { data: AnnotationItem[]; version: number },
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.saveAnnotationsUseCase.execute({
      documentId: id,
      data: body.data,
      version: body.version,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize annotations into PDF' })
  async finalizeDocument(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.finalizeDocumentUseCase.execute({
      documentId: id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Get(':id/pdf-preview')
  @ApiOperation({ summary: 'Stream base PDF for editor preview' })
  async getPdfPreview(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Res() res: Response,
  ) {
    const result = await this.getPdfPreviewUseCase.execute({
      id,
      userId: user.userId,
    })

    const value = getResultValue(result) as { buffer: Buffer; filename: string }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${value.filename}"`,
      'Content-Length': value.buffer.length.toString(),
    })
    res.send(value.buffer)
  }
}
