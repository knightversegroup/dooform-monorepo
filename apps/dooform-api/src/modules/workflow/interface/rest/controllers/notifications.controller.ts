import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common'
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

@ApiTags('Workflow / Notifications')
@Controller('v1/notifications')
@UseFilters(HttpResultExceptionFilter)
export class NotificationsController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('notifications:read')
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async list(
    @CurrentUser() user: UserContext,
    @Query('unread') unread?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-notifications/list-notifications.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-notifications/list-notifications.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        userId: user.userId,
        unreadOnly: unread === 'true',
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      }),
    )
  }

  @Post(':id/read')
  @RequirePermission('notifications:read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/mark-notification-read/mark-notification-read.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/mark-notification-read/mark-notification-read.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ userId: user.userId, notificationId: id }),
    )
  }

  @Post('read-all')
  @RequirePermission('notifications:read')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  async markAllRead(
    @Body() _body: unknown,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/mark-all-notifications-read/mark-all-notifications-read.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/mark-all-notifications-read/mark-all-notifications-read.use-case'
        ),
    )
    return getResultValue(await uc.execute({ userId: user.userId }))
  }
}
