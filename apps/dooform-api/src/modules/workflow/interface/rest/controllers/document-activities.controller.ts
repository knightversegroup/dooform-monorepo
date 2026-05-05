import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

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

@ApiTags('Workflow / Activities')
@Controller('v1/documents/:documentId/activities')
@UseFilters(HttpResultExceptionFilter)
export class DocumentActivitiesController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('activities:read')
  @ApiOperation({ summary: 'List document activity (newest first)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async list(
    @Param('documentId') documentId: string,
    @CurrentUser() user: UserContext,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-document-activities/list-document-activities.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-document-activities/list-document-activities.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        documentId,
        actorUserId: user.userId,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      }),
    )
  }
}
