import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import {
  UpdateMemberRoleDto,
  UpdateOrganizationDto,
  UpdateOrganizationTierDto,
} from '../../../application/dtos/auth.dto'
import { AuthService } from '../../../application/services/auth.service'
import { StorageQuotaService } from '../../../../user/application/services/storage-quota.service'
import { UserRole } from '../../../../user/domain/enums/user.enum'
import { UserTier } from '../../../../document/domain/enums/document.enum'

import { CurrentUser } from '../decorators/current-user.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import type { AuthenticatedUser } from '../types/authenticated-user'

@ApiTags('organization')
@Controller('organization')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(
    private readonly auth: AuthService,
    private readonly quota: StorageQuotaService,
  ) {}

  @Get('storage')
  async getStorage(@CurrentUser() user: AuthenticatedUser) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    return this.quota.getUsage(user.organizationId)
  }

  @Get()
  async getMyOrganization(@CurrentUser() user: AuthenticatedUser) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    const org = await this.auth.getOrganization(user.organizationId)
    return this.toOrg(org)
  }

  @RequirePermission('organization:update')
  @Patch()
  async updateMyOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOrganizationDto,
  ) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    const org = await this.auth.updateOrganization(
      user.organizationId,
      { role: user.role, organizationId: user.organizationId },
      dto,
    )
    return this.toOrg(org)
  }

  @RequirePermission('organization:tier:manage')
  @Patch('tier')
  async updateMyOrganizationTier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOrganizationTierDto,
  ) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    const tier = (dto.tier ?? '').toLowerCase() as UserTier
    if (!Object.values(UserTier).includes(tier)) {
      throw new ForbiddenException('Invalid tier')
    }
    const org = await this.auth.updateOrganizationTier(
      user.organizationId,
      { role: user.role, organizationId: user.organizationId },
      tier,
    )
    return this.toOrg(org)
  }

  @Get('members')
  async listMembers(@CurrentUser() user: AuthenticatedUser) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    const members = await this.auth.listMembers(user.organizationId)
    return members.map((m) => this.toMember(m))
  }

  @RequirePermission('organization:members:manage')
  @Patch('members/:userId/role')
  async updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    const updated = await this.auth.updateMemberRole(
      user.organizationId,
      userId,
      { userId: user.userId, role: user.role, organizationId: user.organizationId },
      dto.role as UserRole,
    )
    return this.toMember(updated)
  }

  @RequirePermission('organization:members:manage')
  @Delete('members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
  ) {
    if (!user.organizationId) throw new ForbiddenException('Not in an organization')
    await this.auth.removeMember(
      user.organizationId,
      userId,
      { userId: user.userId, role: user.role, organizationId: user.organizationId },
    )
  }

  private toOrg(o: {
    id: string
    name: string
    slug: string
    ownerUserId: string | null
    tier?: UserTier
    createdAt: Date
  }) {
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      ownerUserId: o.ownerUserId,
      tier: o.tier ?? UserTier.FREE,
      createdAt: o.createdAt,
    }
  }

  private toMember(m: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
    role: UserRole
    userTier: string
    jobTitle: string | null
    createdAt: Date
  }) {
    return {
      id: m.id,
      email: m.email,
      name: m.displayName,
      avatarUrl: m.avatarUrl,
      role: m.role,
      userTier: m.userTier,
      jobTitle: m.jobTitle,
      createdAt: m.createdAt,
    }
  }
}
