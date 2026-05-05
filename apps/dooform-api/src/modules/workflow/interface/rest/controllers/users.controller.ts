import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common'
import { LazyModuleLoader } from '@nestjs/core'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

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

@ApiTags('Workflow / Users')
@Controller('v1/users')
@UseFilters(HttpResultExceptionFilter)
export class UsersController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @RequirePermission('users:read')
  @ApiOperation({ summary: "List users in the caller's organization" })
  async list(@CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/list-users/list-users.use-case.module'),
      () => import('../../../application/use-cases/list-users/list-users.use-case'),
    )
    return getResultValue(await uc.execute({ organizationId: user.organizationId }))
  }

  @Post()
  @RequirePermission('users:create')
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'displayName'],
      properties: {
        email: { type: 'string' },
        displayName: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
    },
  })
  async create(
    @Body() body: { email: string; displayName: string; avatarUrl?: string },
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-user/create-user.use-case.module'),
      () => import('../../../application/use-cases/create-user/create-user.use-case'),
    )
    return getResultValue(
      await uc.execute({
        email: body.email,
        displayName: body.displayName,
        avatarUrl: body.avatarUrl ?? null,
      }),
    )
  }

  @Get('me')
  @ApiOperation({ summary: 'Echo back the current user context + profile' })
  async me(@CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () =>
        import(
          '../../../application/use-cases/get-current-user/get-current-user.use-case.module'
        ),
      () =>
        import(
          '../../../application/use-cases/get-current-user/get-current-user.use-case'
        ),
    )
    return getResultValue(
      await uc.execute({
        userId: user.userId,
        userTier: user.userTier,
        watermarkDisabled: user.watermarkDisabled,
      }),
    )
  }
}
