import { Controller, Get, UseFilters } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import {
  CurrentUser,
  type UserContext,
} from '../../../../document/interface/rest/decorators/user-context.decorator'

/**
 * Read-only endpoint every authenticated user can hit. Returns the announcements
 * relevant to the caller's organization (global ones plus org-scoped). The console
 * AnnouncementBar polls this on mount.
 */
@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
@UseFilters(HttpResultExceptionFilter)
export class AnnouncementsController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get('active')
  @ApiOperation({ summary: 'List active announcements visible to the caller' })
  async listActive(@CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/list-active-announcements/list-active-announcements.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/list-active-announcements/list-active-announcements.use-case'
        ),
    )
    return getResultValue(await uc.execute({ organizationId: user?.organizationId ?? null }))
  }
}
