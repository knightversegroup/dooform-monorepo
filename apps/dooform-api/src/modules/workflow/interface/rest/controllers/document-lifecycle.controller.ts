import { Body, Controller, Param, Post, UseFilters } from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { getResultValue } from '@dooform-api-core/shared'
import {
  HttpResultExceptionFilter,
  LazyBaseController,
} from '@dooform-api-core/interface/nestjs'

import { DocumentLifecycleStatus } from '../../../../document/domain/enums/document.enum'
import {
  CurrentUser,
  type UserContext,
} from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Workflow / Lifecycle')
@Controller('v1/documents/:documentId')
@UseFilters(HttpResultExceptionFilter)
export class DocumentLifecycleController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Post('transition')
  @RequirePermission('documents:update')
  @ApiOperation({ summary: 'Transition a document to a new lifecycle state' })
  async transition(
    @Param('documentId') documentId: string,
    @Body() body: { to: DocumentLifecycleStatus; note?: string },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/transition-document-lifecycle/transition-document-lifecycle.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/transition-document-lifecycle/transition-document-lifecycle.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        documentId,
        actorUserId: user.userId,
        to: body.to,
        note: body.note,
      }),
    )
  }
}
