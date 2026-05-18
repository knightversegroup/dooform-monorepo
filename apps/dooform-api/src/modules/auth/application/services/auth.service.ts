import { randomUUID, randomBytes } from 'crypto'

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'

import { UserModel } from '../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import { OrganizationModel } from '../../../user/infrastructure/persistence/typeorm/models/organization.model'
import { UserRole } from '../../../user/domain/enums/user.enum'
import { UserTier } from '../../../document/domain/enums/document.enum'
import { MailerService } from '../../../../common/mailer/mailer.service'

import { RefreshTokenModel } from '../../infrastructure/persistence/typeorm/models/refresh-token.model'
import { PasswordResetTokenModel } from '../../infrastructure/persistence/typeorm/models/password-reset-token.model'
import { InviteCodeModel } from '../../infrastructure/persistence/typeorm/models/invite-code.model'
import { AuditLogService } from './audit-log.service'
import { PermissionService } from './permission.service'
import { PasswordService } from '../../infrastructure/services/password.service'
import { TokenService } from '../../infrastructure/services/token.service'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(UserModel) private readonly users: Repository<UserModel>,
    @InjectRepository(OrganizationModel) private readonly organizations: Repository<OrganizationModel>,
    @InjectRepository(RefreshTokenModel) private readonly refreshTokens: Repository<RefreshTokenModel>,
    @InjectRepository(PasswordResetTokenModel)
    private readonly passwordResetTokens: Repository<PasswordResetTokenModel>,
    @InjectRepository(InviteCodeModel) private readonly inviteCodes: Repository<InviteCodeModel>,
    private readonly password: PasswordService,
    private readonly token: TokenService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
    private readonly audit: AuditLogService,
    private readonly permissions: PermissionService,
  ) {}

  /** Holder of `tenants:manage-any-org` — falls back to GLOBAL_ADMIN role string. */
  private canManageAnyOrg(caller: { userId?: string; role: UserRole | string }): boolean {
    if (caller.userId) {
      return this.permissions.userHas({ userId: caller.userId, role: caller.role as string }, 'tenants:manage-any-org')
    }
    return caller.role === UserRole.GLOBAL_ADMIN
  }

  /** Holder of `users:assign-role`. */
  private canAssignRole(caller: { userId?: string; role: UserRole | string }): boolean {
    if (caller.userId) {
      return this.permissions.userHas({ userId: caller.userId, role: caller.role as string }, 'users:assign-role')
    }
    return caller.role === UserRole.GLOBAL_ADMIN || caller.role === UserRole.ORG_ADMIN
  }

  /** Holder of `users:assign-global-admin` — required to promote anyone to GLOBAL_ADMIN. */
  private canAssignGlobalAdmin(caller: { userId?: string; role: UserRole | string }): boolean {
    if (caller.userId) {
      return this.permissions.userHas(
        { userId: caller.userId, role: caller.role as string },
        'users:assign-global-admin',
      )
    }
    return caller.role === UserRole.GLOBAL_ADMIN
  }

  // -------- Registration --------

  async register(input: {
    email: string
    password: string
    name: string
    organizationName?: string
    inviteCode?: string
  }): Promise<{ user: UserModel; tokens: AuthTokens }> {
    const email = input.email.toLowerCase().trim()
    const existing = await this.users.findOne({ where: { email } })
    if (existing) throw new ConflictException('Email already registered')

    let organizationId: string
    let role: UserRole = UserRole.USER

    if (input.inviteCode) {
      const invite = await this.findValidInvite(input.inviteCode)
      organizationId = invite.organizationId ?? (await this.createOrganization(input.name)).id
    } else if (input.organizationName) {
      const org = await this.createOrganization(input.organizationName)
      organizationId = org.id
      role = UserRole.ORG_ADMIN
    } else {
      throw new BadRequestException('Either organizationName or inviteCode is required')
    }

    const passwordHash = await this.password.hash(input.password)
    // Inherit the tier from the organization the user is joining. Brand-new orgs
    // (created above via `createOrganization`) default to FREE; existing orgs that
    // were already upgraded propagate their tier so invitees aren't quietly downgraded.
    const orgRecord = await this.organizations.findOne({ where: { id: organizationId } })
    const inheritedTier = orgRecord?.tier ?? UserTier.FREE
    const user = this.users.create({
      id: randomUUID(),
      email,
      displayName: input.name,
      passwordHash,
      emailVerified: true,
      role,
      userTier: inheritedTier,
      organizationId,
      avatarUrl: null,
      googleId: null,
    })
    const saved = await this.users.save(user)

    if (role === UserRole.ORG_ADMIN) {
      await this.organizations.update({ id: organizationId }, { ownerUserId: saved.id })
    }

    // Mirror the legacy role column into role_assignments so the IAM page,
    // permission checks, and JWT roles[] all see the new user immediately.
    await this.permissions.setPrimarySystemRole(saved.id, role, {
      userId: saved.id,
      role,
      email: saved.email,
      organizationId: saved.organizationId,
    })

    if (input.inviteCode) {
      await this.inviteCodes.update(
        { code: input.inviteCode },
        { usedAt: new Date(), usedByUserId: saved.id },
      )
    }

    const tokens = await this.issueTokens(saved, {})
    this.audit.log({
      organizationId: saved.organizationId,
      actor: { userId: saved.id, email: saved.email, role: saved.role },
      action: 'auth.register',
      resourceType: 'user',
      resourceId: saved.id,
      metadata: { joinedViaInvite: !!input.inviteCode },
    })
    return { user: saved, tokens }
  }

  private async createOrganization(name: string): Promise<OrganizationModel> {
    const slug = await this.uniqueSlug(name)
    const org = this.organizations.create({
      id: randomUUID(),
      name,
      slug,
      ownerUserId: null,
    })
    return this.organizations.save(org)
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'org'
    let slug = base
    let i = 1
    while (await this.organizations.findOne({ where: { slug } })) {
      slug = `${base}-${i++}`
    }
    return slug
  }

  // -------- Login --------

  async login(
    email: string,
    password: string,
    meta: { userAgent?: string; ip?: string } = {},
  ): Promise<{ user: UserModel; tokens: AuthTokens }> {
    const normalized = email.toLowerCase().trim()
    const user = await this.users.findOne({ where: { email: normalized } })
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials')

    const ok = await this.password.compare(password, user.passwordHash)
    if (!ok) {
      this.audit.log({
        organizationId: user.organizationId,
        actor: { userId: user.id, email: user.email, role: user.role },
        action: 'auth.login',
        outcome: 'failure',
        metadata: { reason: 'invalid_password' },
        ip: meta.ip,
        userAgent: meta.userAgent,
      })
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.issueTokens(user, meta)
    this.audit.log({
      organizationId: user.organizationId,
      actor: { userId: user.id, email: user.email, role: user.role },
      action: 'auth.login',
      ip: meta.ip,
      userAgent: meta.userAgent,
    })
    return { user, tokens }
  }

  // -------- Token issuance / refresh --------

  async issueTokens(
    user: UserModel,
    meta: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    // Populate `roles` from the IAM assignments table so the JWT and the
    // frontend `AuthUser` reflect multi-role state. Fall back to the legacy
    // single `role` column if the assignments cache is somehow empty (legacy
    // users mid-migration).
    const activeRoles = this.permissions.activeRoleCodes(user.id)
    const roles = activeRoles.length > 0 ? activeRoles : [user.role]
    const accessToken = this.token.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      roles,
      userTier: user.userTier,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      onboarded: user.onboardedAt !== null,
    })
    const refreshToken = this.token.generateOpaqueToken(32)
    const tokenHash = this.token.hashToken(refreshToken)

    const refreshTtl =
      this.config.get<string>('JWT_REFRESH_TTL') ??
      this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRY', '7d')
    const expiresAt = new Date(Date.now() + this.parseTtlMs(refreshTtl))
    await this.refreshTokens.save(
      this.refreshTokens.create({
        id: randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
        revokedAt: null,
        replacedByTokenId: null,
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
      }),
    )

    return { accessToken, refreshToken }
  }

  async refresh(
    refreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ user: UserModel; tokens: AuthTokens }> {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token')
    const tokenHash = this.token.hashToken(refreshToken)
    const stored = await this.refreshTokens.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    })
    if (!stored) throw new UnauthorizedException('Invalid refresh token')
    if (stored.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired')

    const user = await this.users.findOne({ where: { id: stored.userId } })
    if (!user) throw new UnauthorizedException('User not found')

    // Rotate
    const tokens = await this.issueTokens(user, meta)
    const newHash = this.token.hashToken(tokens.refreshToken)
    const newRecord = await this.refreshTokens.findOne({ where: { tokenHash: newHash } })
    await this.refreshTokens.update(
      { id: stored.id },
      { revokedAt: new Date(), replacedByTokenId: newRecord?.id ?? null },
    )

    return { user, tokens }
  }

  async logout(refreshToken: string | undefined, actor?: { userId?: string; email?: string; role?: string; organizationId?: string | null }): Promise<void> {
    if (!refreshToken) return
    const tokenHash = this.token.hashToken(refreshToken)
    await this.refreshTokens.update({ tokenHash }, { revokedAt: new Date() })
    if (actor) {
      this.audit.log({
        organizationId: actor.organizationId ?? null,
        actor: { userId: actor.userId, email: actor.email, role: actor.role },
        action: 'auth.logout',
      })
    }
  }

  // -------- Password reset --------

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email: email.toLowerCase().trim() } })
    if (!user) return // silent

    const raw = this.token.generateOpaqueToken(24)
    const tokenHash = this.token.hashToken(raw)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await this.passwordResetTokens.save(
      this.passwordResetTokens.create({
        id: randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    )
    const frontend = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200')
    const link = `${frontend}/auth/reset-password?token=${raw}`
    await this.mailer.sendPasswordResetEmail(user.email, link)
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.token.hashToken(rawToken)
    const record = await this.passwordResetTokens.findOne({ where: { tokenHash, usedAt: IsNull() } })
    if (!record) throw new BadRequestException('Invalid or used token')
    if (record.expiresAt.getTime() < Date.now()) throw new BadRequestException('Token expired')

    const user = await this.users.findOne({ where: { id: record.userId } })
    if (!user) throw new NotFoundException('User not found')

    user.passwordHash = await this.password.hash(newPassword)
    await this.users.save(user)
    await this.passwordResetTokens.update({ id: record.id }, { usedAt: new Date() })
    // Revoke all existing refresh tokens for safety.
    await this.refreshTokens.update({ userId: user.id, revokedAt: IsNull() }, { revokedAt: new Date() })
  }

  // -------- Invite codes --------

  async createInviteCode(input: {
    creator: { userId: string; role: UserRole; organizationId: string | null }
    expiresInDays?: number
    organizationId?: string
  }): Promise<InviteCodeModel> {
    let orgId = input.organizationId ?? input.creator.organizationId
    if (!this.canManageAnyOrg(input.creator)) {
      orgId = input.creator.organizationId
    }
    if (!orgId) throw new BadRequestException('No organization for invite code')

    const days = input.expiresInDays ?? 7
    const code = randomBytes(8).toString('hex').toUpperCase().slice(0, 12)
    const record = this.inviteCodes.create({
      id: randomUUID(),
      code,
      organizationId: orgId,
      createdByUserId: input.creator.userId,
      expiresAt: new Date(Date.now() + days * 86_400_000),
      usedAt: null,
      usedByUserId: null,
    })
    const saved = await this.inviteCodes.save(record)
    this.audit.log({
      organizationId: orgId,
      actor: { userId: input.creator.userId, role: input.creator.role },
      action: 'organization.invite.create',
      resourceType: 'invite_code',
      resourceId: saved.id,
      metadata: { code: saved.code, expiresAt: saved.expiresAt },
    })
    return saved
  }

  async listInviteCodes(creator: {
    userId: string
    role: UserRole
    organizationId: string | null
  }): Promise<InviteCodeModel[]> {
    if (this.canManageAnyOrg(creator)) {
      return this.inviteCodes.find({ order: { createdAt: 'DESC' } })
    }
    if (!creator.organizationId) return []
    return this.inviteCodes.find({
      where: { organizationId: creator.organizationId },
      order: { createdAt: 'DESC' },
    })
  }

  async deleteInviteCode(
    id: string,
    caller: { userId?: string; role: UserRole; organizationId: string | null },
  ): Promise<void> {
    const code = await this.inviteCodes.findOne({ where: { id } })
    if (!code) throw new NotFoundException('Invite code not found')
    if (!this.canManageAnyOrg(caller) && code.organizationId !== caller.organizationId) {
      throw new UnauthorizedException('Cannot delete invite code from another organization')
    }
    await this.inviteCodes.softDelete({ id })
  }

  private async findValidInvite(code: string): Promise<InviteCodeModel> {
    const invite = await this.inviteCodes.findOne({ where: { code } })
    if (!invite) throw new BadRequestException('Invalid invite code')
    if (invite.usedAt) throw new BadRequestException('Invite code already used')
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invite code expired')
    }
    return invite
  }

  // -------- /me --------

  async getById(userId: string): Promise<UserModel | null> {
    return this.users.findOne({ where: { id: userId } })
  }

  // -------- Profile updates --------

  async updateProfile(
    userId: string,
    input: {
      name?: string
      avatarUrl?: string
      jobTitle?: string
      timezone?: string
      locale?: string
    },
  ): Promise<UserModel> {
    const user = await this.users.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')
    if (input.name !== undefined) user.displayName = input.name
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl || null
    if (input.jobTitle !== undefined) user.jobTitle = input.jobTitle || null
    if (input.timezone !== undefined) user.timezone = input.timezone || null
    if (input.locale !== undefined) user.locale = input.locale || null
    return this.users.save(user)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } })
    if (!user || !user.passwordHash) throw new BadRequestException('No password set on this account')
    const ok = await this.password.compare(currentPassword, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Current password is incorrect')
    user.passwordHash = await this.password.hash(newPassword)
    await this.users.save(user)
    // Revoke all refresh tokens for safety.
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() })
    this.audit.log({
      organizationId: user.organizationId,
      actor: { userId: user.id, email: user.email, role: user.role },
      action: 'auth.password.change',
    })
  }

  // -------- Organization --------

  async getOrganization(orgId: string): Promise<OrganizationModel> {
    const org = await this.organizations.findOne({ where: { id: orgId } })
    if (!org) throw new NotFoundException('Organization not found')
    return org
  }

  async updateOrganization(
    orgId: string,
    caller: { userId?: string; role: UserRole; organizationId: string | null },
    input: { name?: string },
  ): Promise<OrganizationModel> {
    if (!this.canManageAnyOrg(caller) && caller.organizationId !== orgId) {
      throw new ForbiddenException('Cannot modify another organization')
    }
    const org = await this.getOrganization(orgId)
    if (input.name !== undefined) {
      org.name = input.name
      org.slug = await this.uniqueSlug(input.name)
    }
    return this.organizations.save(org)
  }

  /**
   * Change a tenant's subscription tier. ORG_ADMIN can self-upgrade (in production
   * this would gate behind a billing flow); GLOBAL_ADMIN may set any tenant's tier.
   * Members of the org get their personal `userTier` mirrored to the new tier so
   * existing tier-based gates (template visibility, watermark removal, etc.) keep
   * working unchanged.
   */
  async updateOrganizationTier(
    orgId: string,
    caller: { userId?: string; role: UserRole; organizationId: string | null },
    tier: UserTier,
  ): Promise<OrganizationModel> {
    if (!this.canManageAnyOrg(caller) && caller.organizationId !== orgId) {
      throw new ForbiddenException('Cannot modify another organization')
    }
    const org = await this.getOrganization(orgId)
    org.tier = tier
    const saved = await this.organizations.save(org)
    // Propagate to all members so per-user gates (set on JWT issuance) reflect the
    // new tier on next refresh. Existing JWTs still hold the old tier until they
    // expire — the AuthContext refetches on focus so it'll catch up quickly.
    await this.users.update({ organizationId: orgId }, { userTier: tier })
    return saved
  }

  async listMembers(orgId: string): Promise<UserModel[]> {
    return this.users.find({ where: { organizationId: orgId }, order: { displayName: 'ASC' } })
  }

  async updateMemberRole(
    orgId: string,
    targetUserId: string,
    caller: { userId: string; role: UserRole; organizationId: string | null },
    role: UserRole,
  ): Promise<UserModel> {
    if (!this.canManageAnyOrg(caller) && caller.organizationId !== orgId) {
      throw new ForbiddenException('Cannot modify members of another organization')
    }
    if (!this.canAssignRole(caller)) {
      throw new ForbiddenException('Missing users:assign-role permission')
    }
    if (role === UserRole.GLOBAL_ADMIN && !this.canAssignGlobalAdmin(caller)) {
      throw new ForbiddenException('Missing users:assign-global-admin permission')
    }
    const target = await this.users.findOne({ where: { id: targetUserId } })
    if (!target || target.organizationId !== orgId) throw new NotFoundException('Member not found')
    if (target.id === caller.userId && role !== caller.role) {
      throw new BadRequestException('Cannot change your own role')
    }
    const previousRole = target.role
    target.role = role
    const saved = await this.users.save(target)
    // Sync the change into role_assignments so the IAM page and permission
    // checks immediately reflect the legacy role write.
    await this.permissions.setPrimarySystemRole(target.id, role, {
      userId: caller.userId,
      role: caller.role,
      organizationId: caller.organizationId,
    })
    this.audit.log({
      organizationId: orgId,
      actor: { userId: caller.userId, role: caller.role },
      action: 'organization.member.role_change',
      resourceType: 'user',
      resourceId: target.id,
      metadata: { from: previousRole, to: role, email: target.email },
    })
    return saved
  }

  async removeMember(
    orgId: string,
    targetUserId: string,
    caller: { userId: string; role: UserRole; organizationId: string | null },
  ): Promise<void> {
    if (!this.canManageAnyOrg(caller) && caller.organizationId !== orgId) {
      throw new ForbiddenException('Cannot modify members of another organization')
    }
    if (targetUserId === caller.userId) {
      throw new BadRequestException('Cannot remove yourself')
    }
    const target = await this.users.findOne({ where: { id: targetUserId } })
    if (!target || target.organizationId !== orgId) throw new NotFoundException('Member not found')
    // Detach: keep the user record but unlink the org. Their owned docs stay attributed.
    target.organizationId = null
    target.role = UserRole.USER
    await this.users.save(target)
    // Revoke all refresh tokens so the removed member is logged out.
    await this.refreshTokens.update({ userId: target.id, revokedAt: IsNull() }, { revokedAt: new Date() })
    this.audit.log({
      organizationId: orgId,
      actor: { userId: caller.userId, role: caller.role },
      action: 'organization.member.remove',
      resourceType: 'user',
      resourceId: target.id,
      metadata: { email: target.email },
    })
  }

  // -------- Onboarding --------

  async completeOnboarding(
    userId: string,
    input: {
      name: string
      avatarUrl?: string
      organizationName?: string
      jobTitle?: string
      timezone?: string
      locale?: string
    },
  ): Promise<{ user: UserModel; tokens: AuthTokens }> {
    const user = await this.users.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    user.displayName = input.name
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl || null
    if (input.jobTitle !== undefined) user.jobTitle = input.jobTitle || null
    if (input.timezone !== undefined) user.timezone = input.timezone || null
    if (input.locale !== undefined) user.locale = input.locale || null
    user.onboardedAt = new Date()
    const savedUser = await this.users.save(user)

    if (input.organizationName && user.organizationId && user.role === UserRole.ORG_ADMIN) {
      const newSlug = await this.uniqueSlug(input.organizationName)
      await this.organizations.update(
        { id: user.organizationId },
        { name: input.organizationName, slug: newSlug },
      )
    }

    // Reissue tokens so the new `onboarded:true` claim takes effect immediately.
    const tokens = await this.issueTokens(savedUser, {})
    return { user: savedUser, tokens }
  }

  // -------- helpers --------

  private parseTtlMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim())
    if (!match) return 7 * 86_400_000
    const n = parseInt(match[1], 10)
    const unit = match[2]
    const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
    return n * (multipliers[unit] ?? 86_400_000)
  }
}
