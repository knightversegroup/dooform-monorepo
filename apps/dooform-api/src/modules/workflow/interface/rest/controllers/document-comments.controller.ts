import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

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

@ApiTags('Workflow / Comments')
@Controller('v1/documents/:documentId/comments')
@UseFilters(HttpResultExceptionFilter)
export class DocumentCommentsController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'List comments on a document' })
  async list(
    @Param('documentId') documentId: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-document-comments/list-document-comments.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-document-comments/list-document-comments.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, actorUserId: user.userId }),
    )
  }

  @Post()
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Add a comment' })
  async create(
    @Param('documentId') documentId: string,
    @Body() body: { body: string; parentId?: string | null },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/create-document-comment/create-document-comment.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/create-document-comment/create-document-comment.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        documentId,
        actorUserId: user.userId,
        body: body.body,
        parentId: body.parentId ?? null,
      }),
    )
  }

  @Delete(':commentId')
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(
    @Param('documentId') documentId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/delete-document-comment/delete-document-comment.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/delete-document-comment/delete-document-comment.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, commentId, actorUserId: user.userId }),
    )
  }
}
