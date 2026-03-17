import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common'

import { Roles } from '../../../../../common/decorators/roles.decorator'
import { CurrentUser, type RequestUser } from '../../../../../common/decorators/current-user.decorator'

import { AdminService } from '../../../application/services/admin.service'
import { ListUsersQueryDto, AssignRoleDto, SetQuotaDto, AddQuotaDto } from '../../../application/dtos/admin.dto'

@Controller('auth/admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query)
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id)
  }

  @Delete('users/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.deleteUser(id, user.userId)
  }

  @Post('users/:id/roles')
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.assignRole(id, dto, user.userId)
  }

  @Delete('users/:id/roles/:roleId')
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.removeRole(id, roleId, user.userId)
  }

  @Put('users/:id/quota')
  async setUserQuota(
    @Param('id') id: string,
    @Body() dto: SetQuotaDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.setUserQuota(id, dto, user.userId)
  }

  @Post('users/:id/quota/add')
  async addQuota(
    @Param('id') id: string,
    @Body() dto: AddQuotaDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.addQuota(id, dto, user.userId)
  }

  @Post('users/:id/quota/reset')
  async resetQuotaUsage(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.resetQuotaUsage(id, user.userId)
  }

  @Get('users/:id/quota/history')
  async getQuotaHistory(@Param('id') id: string) {
    return this.adminService.getQuotaHistory(id)
  }

  @Get('roles')
  async listRoles() {
    return this.adminService.listRoles()
  }
}
