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
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import type { Request, Response } from 'express'

import {
  ChangePasswordDto,
  CompleteOnboardingDto,
  CreateInviteCodeDto,
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from '../../../application/dtos/auth.dto'
import { AuthService } from '../../../application/services/auth.service'
import { PermissionService } from '../../../application/services/permission.service'
import { CookieService } from '../../../infrastructure/services/cookie.service'

import { Public } from '../decorators/public.decorator'
import { RequirePermission } from '../decorators/require-permission.decorator'
import { CurrentUser } from '../decorators/current-user.decorator'
import { SkipAudit } from '../decorators/audit.decorators'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { UserRole } from '../../../../user/domain/enums/user.enum'
import type { AuthenticatedUser } from '../types/authenticated-user'

const meta = (req: Request) => ({
  userAgent: req.headers['user-agent']?.toString().slice(0, 500),
  ip: req.ip ?? req.socket?.remoteAddress ?? undefined,
})

// Auth controller writes its own enriched audit entries (login success/failure,
// password change, etc.) inside the service layer. Skip the global interceptor for the
// whole controller so we don't double-log every login.
@ApiTags('auth')
@Controller('auth')
@SkipAudit()
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: CookieService,
    private readonly permissions: PermissionService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.register(dto)
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    return this.toMe(user)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.login(dto.email, dto.password, meta(req))
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    return this.toMe(user)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[CookieService.REFRESH_COOKIE]
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token')
    const { user, tokens } = await this.auth.refresh(refreshToken, meta(req))
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    return this.toMe(user)
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request & { user?: AuthenticatedUser }, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[CookieService.REFRESH_COOKIE]
    const actor = req.user
      ? {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          organizationId: req.user.organizationId,
        }
      : undefined
    await this.auth.logout(refreshToken, actor)
    this.cookies.clearAuthCookies(res)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const fresh = await this.auth.getById(user.userId)
    if (!fresh) throw new UnauthorizedException()
    return this.toMe(fresh)
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.auth.requestPasswordReset(dto.email)
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.password)
  }

  // ---------- Profile ----------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  async updateProfile(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.auth.updateProfile(current.userId, dto)
    return this.toMe(user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.changePassword(current.userId, dto.currentPassword, dto.newPassword)
    this.cookies.clearAuthCookies(res)
  }

  // ---------- Onboarding ----------

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('complete-onboarding')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: CompleteOnboardingDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.completeOnboarding(current.userId, dto)
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken)
    return this.toMe(user)
  }

  // ---------- Invite codes ----------

  @UseGuards(JwtAuthGuard)
  @RequirePermission('organization:invites:manage')
  @ApiBearerAuth()
  @Get('invite-codes')
  async listInviteCodes(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.listInviteCodes({
      userId: user.userId,
      role: user.role,
      organizationId: user.organizationId,
    })
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermission('organization:invites:manage')
  @ApiBearerAuth()
  @Post('invite-codes')
  async createInviteCode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInviteCodeDto,
  ) {
    if (dto.organizationId && user.role !== UserRole.GLOBAL_ADMIN) {
      throw new ForbiddenException('Only GLOBAL_ADMIN may target other organizations')
    }
    return this.auth.createInviteCode({
      creator: { userId: user.userId, role: user.role, organizationId: user.organizationId },
      expiresInDays: dto.expiresInDays,
      organizationId: dto.organizationId,
    })
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermission('organization:invites:manage')
  @ApiBearerAuth()
  @Delete('invite-codes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInviteCode(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.auth.deleteInviteCode(id, {
      role: user.role,
      organizationId: user.organizationId,
    })
  }

  private toMe(user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
    role: UserRole
    userTier: string
    organizationId: string | null
    emailVerified: boolean
    onboardedAt: Date | null
    timezone: string | null
    locale: string | null
    jobTitle: string | null
  }) {
    const grants = this.permissions.grants()
    return {
      id: user.id,
      email: user.email,
      name: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      userTier: user.userTier,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      onboarded: user.onboardedAt !== null,
      timezone: user.timezone,
      locale: user.locale,
      jobTitle: user.jobTitle,
      // Effective permissions for this role at the time of issue. The frontend uses these
      // to hide buttons/links the user can't act on. Backend still re-checks on every request.
      permissions: grants[user.role] ?? [],
    }
  }
}
