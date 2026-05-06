import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import {
  CurrentUser,
  type UserContext,
} from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

/**
 * Admin CRUD over announcements. Gated by `announcements:manage` which is only
 * granted to GLOBAL_ADMIN by default.
 */
@ApiTags('Admin / Announcements')
@ApiBearerAuth()
@Controller('admin/announcements')
@UseFilters(HttpResultExceptionFilter)
export class AdminAnnouncementsController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('announcements:manage')
  @ApiOperation({ summary: 'List every announcement (admin)' })
  async list() {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-all-announcements/list-all-announcements.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-all-announcements/list-all-announcements.use-case'
        ),
    )
    return getResultValue(await uc.execute({}))
  }

  @Post()
  @RequirePermission('announcements:manage')
  @ApiOperation({ summary: 'Create an announcement' })
  async create(@Body() body: Record<string, any>, @CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/create-announcement/create-announcement.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/create-announcement/create-announcement.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({ ...body, createdByUserId: user?.userId }),
    )
  }

  @Put(':id')
  @RequirePermission('announcements:manage')
  @ApiOperation({ summary: 'Update an announcement' })
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/update-announcement/update-announcement.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/update-announcement/update-announcement.use-case'
        ),
    )
    return getResultValue(await uc.execute({ id, ...body }))
  }

  @Delete(':id')
  @RequirePermission('announcements:manage')
  @ApiOperation({ summary: 'Delete an announcement (soft delete)' })
  async delete(@Param('id') id: string) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/delete-announcement/delete-announcement.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/delete-announcement/delete-announcement.use-case'
        ),
    )
    return getResultValue(await uc.execute({ id }))
  }
}
