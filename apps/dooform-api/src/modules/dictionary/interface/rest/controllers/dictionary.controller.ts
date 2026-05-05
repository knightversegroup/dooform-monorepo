import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { CurrentUser, type UserContext } from '../../../../document/interface/rest/decorators/user-context.decorator'
import { RequirePermission } from '../../../../auth/interface/rest/decorators/require-permission.decorator'

@ApiTags('Dictionary')
@ApiBearerAuth()
@Controller('v1/dictionary')
@UseFilters(HttpResultExceptionFilter)
export class DictionaryController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  // --- Collections -----------------------------------------------------------

  @Get('collections')
  @RequirePermission('dictionary:read')
  @ApiOperation({ summary: 'List dictionary collections visible to the caller' })
  @ApiQuery({ name: 'scope', required: false, enum: ['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listCollections(
    @Query('scope') scope: 'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL' | undefined,
    @Query('search') search: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/list-collections/list-collections.use-case.module'),
      () => import('../../../application/use-cases/list-collections/list-collections.use-case'),
    )
    return getResultValue(
      await uc.execute({
        scope,
        search,
        page: page != null ? Number(page) : undefined,
        pageSize: pageSize != null ? Number(pageSize) : undefined,
        ...this.ctx(user),
      }),
    )
  }

  @Get('collections/:id')
  @RequirePermission('dictionary:read')
  async getCollection(@Param('id') id: string, @CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-collection/get-collection.use-case.module'),
      () => import('../../../application/use-cases/get-collection/get-collection.use-case'),
    )
    return getResultValue(await uc.execute({ id, ...this.ctx(user) }))
  }

  @Post('collections')
  @RequirePermission('dictionary:create')
  async createCollection(@Body() body: Record<string, any>, @CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-collection/create-collection.use-case.module'),
      () => import('../../../application/use-cases/create-collection/create-collection.use-case'),
    )
    return getResultValue(await uc.execute({ ...body, ...this.ctx(user) }))
  }

  @Put('collections/:id')
  @RequirePermission('dictionary:update')
  async updateCollection(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-collection/update-collection.use-case.module'),
      () => import('../../../application/use-cases/update-collection/update-collection.use-case'),
    )
    return getResultValue(await uc.execute({ id, ...body, ...this.ctx(user) }))
  }

  @Delete('collections/:id')
  @RequirePermission('dictionary:delete')
  async deleteCollection(@Param('id') id: string, @CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-collection/delete-collection.use-case.module'),
      () => import('../../../application/use-cases/delete-collection/delete-collection.use-case'),
    )
    return getResultValue(await uc.execute({ id, ...this.ctx(user) }))
  }

  @Put('collections/:id/publish')
  @RequirePermission('dictionary:update')
  async publishCollection(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.togglePublishCollection(id, true, user)
  }

  @Put('collections/:id/unpublish')
  @RequirePermission('dictionary:update')
  async unpublishCollection(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.togglePublishCollection(id, false, user)
  }

  // --- Entries (nested) ------------------------------------------------------

  @Get('collections/:collectionId/entries')
  @RequirePermission('dictionary:read')
  @ApiOperation({ summary: 'List entries inside a collection' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listEntries(
    @Param('collectionId') collectionId: string,
    @Query('search') search: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/list-entries/list-entries.use-case.module'),
      () => import('../../../application/use-cases/list-entries/list-entries.use-case'),
    )
    return getResultValue(
      await uc.execute({
        collectionId,
        search,
        page: page != null ? Number(page) : undefined,
        pageSize: pageSize != null ? Number(pageSize) : undefined,
        ...this.ctx(user),
      }),
    )
  }

  @Post('collections/:collectionId/entries')
  @RequirePermission('dictionary:create')
  async createEntry(
    @Param('collectionId') collectionId: string,
    @Body() body: Record<string, any>,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-entry/create-entry.use-case.module'),
      () => import('../../../application/use-cases/create-entry/create-entry.use-case'),
    )
    return getResultValue(
      await uc.execute({ collectionId, ...body, ...this.ctx(user) }),
    )
  }

  @Put('entries/:id')
  @RequirePermission('dictionary:update')
  async updateEntry(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-entry/update-entry.use-case.module'),
      () => import('../../../application/use-cases/update-entry/update-entry.use-case'),
    )
    return getResultValue(await uc.execute({ id, ...body, ...this.ctx(user) }))
  }

  @Delete('entries/:id')
  @RequirePermission('dictionary:delete')
  async deleteEntry(@Param('id') id: string, @CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-entry/delete-entry.use-case.module'),
      () => import('../../../application/use-cases/delete-entry/delete-entry.use-case'),
    )
    return getResultValue(await uc.execute({ id, ...this.ctx(user) }))
  }

  // --- helpers ---------------------------------------------------------------

  private ctx(user: UserContext) {
    return {
      callerRole: user?.role,
      callerOrganizationId: user?.organizationId ?? null,
      callerUserId: user?.userId,
    }
  }

  private async togglePublishCollection(id: string, publish: boolean, user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/publish-collection/publish-collection.use-case.module'),
      () => import('../../../application/use-cases/publish-collection/publish-collection.use-case'),
    )
    return getResultValue(await uc.execute({ id, publish, ...this.ctx(user) }))
  }
}
