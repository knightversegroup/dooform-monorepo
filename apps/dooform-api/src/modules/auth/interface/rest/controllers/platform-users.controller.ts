import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator'

import { PlatformDirectoryService } from '../../../../user/application/services/platform-directory.service'

import { CurrentUser } from '../decorators/current-user.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../types/authenticated-user'

class AdminPatchUserDto {
  @IsOptional() @IsString() displayName?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() jobTitle?: string | null
  @IsOptional() @IsString() timezone?: string | null
  @IsOptional() @IsString() locale?: string | null
  @IsOptional() @IsBoolean() emailVerified?: boolean
  @IsOptional() @IsUUID() organizationId?: string | null
  @IsOptional() @IsString() userTier?: string
}

class SetUserActiveDto {
  @IsBoolean()
  isActive!: boolean
}

/**
 * Cross-org user directory for global admins. Mirrors the tenants admin pattern
 * but for principals. Gated on `platform:tenants:manage` so anyone who can see
 * orgs can also see who's in them — without granting role-mutation power.
 */
@ApiTags('admin / users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlatformUsersController {
  constructor(private readonly directory: PlatformDirectoryService) {}

  @Get()
  @RequirePermission('platform:tenants:manage')
  async list(
    @Query('organizationId') organizationId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    // `?organizationId=none` filters to users not yet in any org.
    const orgFilter =
      organizationId === 'none' ? null : organizationId ? organizationId : undefined
    return this.directory.listUsers({
      organizationId: orgFilter,
      search,
      page: page ? Number(page) : 0,
      pageSize: pageSize ? Number(pageSize) : 50,
    })
  }

  @Patch(':id')
  @RequirePermission('platform:tenants:manage')
  async updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AdminPatchUserDto,
  ) {
    const user = await this.directory.adminUpdateUser(id, dto, {
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      organizationId: actor.organizationId,
    })
    return { id: user.id, email: user.email, displayName: user.displayName }
  }

  @Patch(':id/active')
  @RequirePermission('platform:tenants:manage')
  async setActive(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SetUserActiveDto,
  ) {
    const user = await this.directory.adminSetUserActive(id, dto.isActive, {
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      organizationId: actor.organizationId,
    })
    return { id: user.id, isActive: user.isActive }
  }

  @Post(':id/reset-password')
  @RequirePermission('platform:tenants:manage')
  async resetPassword(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.directory.adminSendPasswordReset(id, {
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      organizationId: actor.organizationId,
    })
  }
}
