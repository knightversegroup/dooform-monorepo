import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

import { ShareRole } from '../../../domain/enums/workflow.enum'
import {
  CurrentUser,
  type UserContext,
} from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Workflow / Shares')
@Controller('v1/documents/:documentId/shares')
@UseFilters(HttpResultExceptionFilter)
export class DocumentSharesController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('documents:read')
  @ApiOperation({ summary: 'List shares for a document' })
  async list(@Param('documentId') documentId: string) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-document-shares/list-document-shares.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-document-shares/list-document-shares.use-case'
        ),
    )
    return getResultValue(await uc.execute({ documentId }))
  }

  @Post()
  @RequirePermission('documents:share')
  @ApiOperation({ summary: 'Share document with a user' })
  async create(
    @Param('documentId') documentId: string,
    @Body() body: { userId: string; role: ShareRole },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/create-document-share/create-document-share.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/create-document-share/create-document-share.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        documentId,
        actorUserId: user.userId,
        targetUserId: body.userId,
        role: body.role,
      }),
    )
  }

  @Patch(':shareId')
  @RequirePermission('documents:share')
  @ApiOperation({ summary: 'Change a share role' })
  async update(
    @Param('documentId') documentId: string,
    @Param('shareId') shareId: string,
    @Body() body: { role: ShareRole },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/update-document-share/update-document-share.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/update-document-share/update-document-share.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, shareId, actorUserId: user.userId, role: body.role }),
    )
  }

  @Delete(':shareId')
  @RequirePermission('documents:share')
  @ApiOperation({ summary: 'Revoke a share' })
  async remove(
    @Param('documentId') documentId: string,
    @Param('shareId') shareId: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/delete-document-share/delete-document-share.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/delete-document-share/delete-document-share.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ documentId, shareId, actorUserId: user.userId }),
    )
  }
}
