import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import 'multer'

import { getResultValue } from '@dooform-api-core/shared'
import {
  HttpResultExceptionFilter,
  LazyBaseController,
} from '@dooform-api-core/interface/nestjs'

import {
  CurrentUser,
  type UserContext,
} from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Workflow / Signatures')
@Controller('v1/documents/:documentId/signatures')
@UseFilters(HttpResultExceptionFilter)
export class DocumentSignaturesController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'List signatures on a document' })
  async list(
    @Param('documentId') documentId: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-document-signatures/list-document-signatures.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-document-signatures/list-document-signatures.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, actorUserId: user.userId }),
    )
  }

  @Post()
  @RequirePermission('documents:sign')
  @ApiOperation({ summary: 'Add a signature (PNG image + placement)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'pageIndex', 'x', 'y', 'width', 'height'],
      properties: {
        image: { type: 'string', format: 'binary' },
        pageIndex: { type: 'number' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      pageIndex: string | number
      x: string | number
      y: string | number
      width: string | number
      height: string | number
    },
    @CurrentUser() user: UserContext,
  ) {
    if (!file) throw new BadRequestException('Signature image is required')
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/create-document-signature/create-document-signature.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/create-document-signature/create-document-signature.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        documentId,
        actorUserId: user.userId,
        imageBuffer: file.buffer,
        imageMime: file.mimetype || 'image/png',
        pageIndex: Number(body.pageIndex),
        x: Number(body.x),
        y: Number(body.y),
        width: Number(body.width),
        height: Number(body.height),
      }),
    )
  }

  @Delete(':signatureId')
  @RequirePermission('documents:sign')
  @ApiOperation({ summary: 'Remove a signature' })
  async remove(
    @Param('documentId') documentId: string,
    @Param('signatureId') signatureId: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/delete-document-signature/delete-document-signature.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/delete-document-signature/delete-document-signature.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, signatureId, actorUserId: user.userId }),
    )
  }
}
