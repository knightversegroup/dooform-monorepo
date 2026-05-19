import { randomUUID } from 'crypto'

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, IsNull, Repository } from 'typeorm'

import { UserModel } from '../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import { OrganizationModel } from '../../infrastructure/persistence/typeorm/models/organization.model'
import { PasswordResetTokenModel } from '../../../auth/infrastructure/persistence/typeorm/models/password-reset-token.model'
import { RefreshTokenModel } from '../../../auth/infrastructure/persistence/typeorm/models/refresh-token.model'
import { AuditLogService } from '../../../auth/application/services/audit-log.service'
import { TokenService } from '../../../auth/infrastructure/services/token.service'
import { MailerService } from '../../../../common/mailer/mailer.service'
import { UserRole } from '../../domain/enums/user.enum'
import { UserTier } from '../../../document/domain/enums/document.enum'

export interface PlatformUserRow {
  id: string
  email: string
  displayName: string
  role: string
  userTier: string
  organizationId: string | null
  organizationName: string | null
  organizationSlug: string | null
  emailVerified: boolean
  isActive: boolean
  createdAt: Date
  onboardedAt: Date | null
}

export interface ListPlatformUsersOptions {
  organizationId?: string | null
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Cross-org user directory for global admins. Used by /admin/users.
 *
 * Reads only — no mutation paths. Role management goes through
 * PermissionsController; tenant management goes through TenantsAdminController.
 * This service joins users to their organization in one trip and returns flat
 * rows suitable for a table view.
 */
export interface AdminPatchUserInput {
  displayName?: string
  email?: string
  jobTitle?: string | null
  timezone?: string | null
  locale?: string | null
  emailVerified?: boolean
  organizationId?: string | null
  /**
   * Per-user feature tier (free / pro / max). Heads up: this is overwritten
   * for every user in an org whenever the org's tier is changed via
   * `/organization/tier`. Use sparingly — typically only for one-off
   * promotion of a specific user.
   */
  userTier?: string
}

export interface AdminActor {
  userId: string
  email?: string | null
  role?: string | null
  organizationId?: string | null
}

@Injectable()
export class PlatformDirectoryService {
  constructor(
    @InjectRepository(UserModel)
    private readonly users: Repository<UserModel>,
    @InjectRepository(OrganizationModel)
    private readonly organizations: Repository<OrganizationModel>,
    @InjectRepository(PasswordResetTokenModel)
    private readonly passwordResetTokens: Repository<PasswordResetTokenModel>,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokens: Repository<RefreshTokenModel>,
    private readonly mailer: MailerService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => AuditLogService))
    private readonly auditLog: AuditLogService,
  ) {}

  async listUsers(
    options: ListPlatformUsersOptions = {},
  ): Promise<{ data: PlatformUserRow[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(0, options.page ?? 0)
    const pageSize = Math.min(200, Math.max(1, options.pageSize ?? 50))

    const qb = this.users
      .createQueryBuilder('u')
      .leftJoin(OrganizationModel, 'o', 'o.id = u.organization_id')
      .select([
        'u.id AS id',
        'u.email AS email',
        'u.display_name AS "displayName"',
        'u.role AS role',
        'u.user_tier AS "userTier"',
        'u.organization_id AS "organizationId"',
        'o.name AS "organizationName"',
        'o.slug AS "organizationSlug"',
        'u.email_verified AS "emailVerified"',
        'u.is_active AS "isActive"',
        'u.created_at AS "createdAt"',
        'u.onboarded_at AS "onboardedAt"',
      ])
      .orderBy('u.created_at', 'DESC')

    if (options.organizationId === null) {
      qb.andWhere('u.organization_id IS NULL')
    } else if (options.organizationId) {
      qb.andWhere('u.organization_id = :orgId', { orgId: options.organizationId })
    }

    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(u.email) LIKE :term')
            .orWhere('LOWER(u.display_name) LIKE :term')
            .orWhere('LOWER(o.name) LIKE :term')
        }),
        { term },
      )
    }

    // getRawMany() loses TypeORM's count helper; do the count separately.
    const countQb = this.users
      .createQueryBuilder('u')
      .leftJoin(OrganizationModel, 'o', 'o.id = u.organization_id')
    if (options.organizationId === null) {
      countQb.andWhere('u.organization_id IS NULL')
    } else if (options.organizationId) {
      countQb.andWhere('u.organization_id = :orgId', { orgId: options.organizationId })
    }
    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`
      countQb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(u.email) LIKE :term')
            .orWhere('LOWER(u.display_name) LIKE :term')
            .orWhere('LOWER(o.name) LIKE :term')
        }),
        { term },
      )
    }
    const total = await countQb.getCount()

    qb.offset(page * pageSize).limit(pageSize)
    const data = (await qb.getRawMany()) as PlatformUserRow[]
    return { data, total, page, pageSize }
  }

  // ---------------------------------------------------------------------------
  // Admin mutations
  // ---------------------------------------------------------------------------

  /**
   * Admin edit. Trims string fields, normalises email lowercase, rejects
   * duplicate emails, and verifies the target organization exists if a move
   * is requested. Returns the saved user.
   */
  async adminUpdateUser(
    targetUserId: string,
    patch: AdminPatchUserInput,
    actor: AdminActor,
  ): Promise<UserModel> {
    const target = await this.users.findOne({ where: { id: targetUserId } })
    if (!target) throw new NotFoundException('User not found')

    const before = {
      email: target.email,
      displayName: target.displayName,
      organizationId: target.organizationId,
      emailVerified: target.emailVerified,
      jobTitle: target.jobTitle,
      timezone: target.timezone,
      locale: target.locale,
      userTier: target.userTier,
    }

    if (patch.email !== undefined) {
      const email = patch.email.toLowerCase().trim()
      if (!email) throw new BadRequestException('Email cannot be empty')
      if (email !== target.email) {
        const dupe = await this.users.findOne({ where: { email } })
        if (dupe && dupe.id !== target.id) {
          throw new BadRequestException('That email is already in use')
        }
        target.email = email
        // Email change resets verification — admin can re-set it explicitly via
        // emailVerified=true in the same payload if they trust the new address.
        target.emailVerified = patch.emailVerified ?? false
      }
    }
    if (patch.emailVerified !== undefined) target.emailVerified = patch.emailVerified
    if (patch.displayName !== undefined) target.displayName = patch.displayName.trim()
    if (patch.jobTitle !== undefined) target.jobTitle = patch.jobTitle?.trim() || null
    if (patch.timezone !== undefined) target.timezone = patch.timezone?.trim() || null
    if (patch.locale !== undefined) target.locale = patch.locale?.trim() || null
    if (patch.organizationId !== undefined) {
      if (patch.organizationId === null) {
        target.organizationId = null
      } else {
        const org = await this.organizations.findOne({ where: { id: patch.organizationId } })
        if (!org) throw new NotFoundException('Organization not found')
        target.organizationId = org.id
      }
    }
    if (patch.userTier !== undefined) {
      const allowed = Object.values(UserTier)
      if (!allowed.includes(patch.userTier as UserTier)) {
        throw new BadRequestException(
          `Invalid tier "${patch.userTier}" — expected one of ${allowed.join(', ')}`,
        )
      }
      target.userTier = patch.userTier as UserTier
    }

    const saved = await this.users.save(target)

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'admin.user.updated',
      resourceType: 'user',
      resourceId: saved.id,
      metadata: {
        before,
        after: {
          email: saved.email,
          displayName: saved.displayName,
          organizationId: saved.organizationId,
          emailVerified: saved.emailVerified,
          jobTitle: saved.jobTitle,
          timezone: saved.timezone,
          locale: saved.locale,
          userTier: saved.userTier,
        },
      },
    })
    return saved
  }

  /**
   * Soft enable/disable. The row stays in the database so existing audit logs,
   * document ownership, and references remain intact, but the user can no
   * longer log in. On deactivate, all live refresh tokens are revoked.
   *
   * Guards: the actor can't deactivate themselves, and deactivating the last
   * active GLOBAL_ADMIN is refused.
   */
  async adminSetUserActive(
    targetUserId: string,
    isActive: boolean,
    actor: AdminActor,
  ): Promise<UserModel> {
    if (targetUserId === actor.userId && !isActive) {
      throw new ForbiddenException('Cannot deactivate yourself')
    }
    const target = await this.users.findOne({ where: { id: targetUserId } })
    if (!target) throw new NotFoundException('User not found')
    if (target.isActive === isActive) return target

    if (!isActive && target.role === UserRole.GLOBAL_ADMIN) {
      const remainingActiveAdmins = await this.users.count({
        where: { role: UserRole.GLOBAL_ADMIN, isActive: true },
      })
      if (remainingActiveAdmins <= 1) {
        throw new BadRequestException(
          'Cannot deactivate the last active global admin — promote and activate another user first',
        )
      }
    }

    target.isActive = isActive
    const saved = await this.users.save(target)

    if (!isActive) {
      // Kill live sessions so a freshly-deactivated user can't keep using the
      // app on whatever JWT they had cached.
      await this.refreshTokens.update(
        { userId: target.id, revokedAt: IsNull() },
        { revokedAt: new Date() },
      )
    }

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: isActive ? 'admin.user.activated' : 'admin.user.deactivated',
      resourceType: 'user',
      resourceId: target.id,
      metadata: { email: target.email, role: target.role },
    })
    return saved
  }

  /**
   * Admin-initiated password reset. Mints a reset token, mails it to the user,
   * and revokes every existing refresh token so the old session can't outlive
   * the lockout. Mirrors `AuthService.requestPasswordReset` but is keyed on
   * userId (not email) and is always allowed for the caller (no silent-no-op).
   *
   * Returns the unhashed token in dev so the admin can copy it if email is
   * disabled. In production the mailer is the only delivery channel.
   */
  async adminSendPasswordReset(
    targetUserId: string,
    actor: AdminActor,
  ): Promise<{ sentTo: string; tokenForDev?: string }> {
    const target = await this.users.findOne({ where: { id: targetUserId } })
    if (!target) throw new NotFoundException('User not found')

    const raw = this.tokenService.generateOpaqueToken(24)
    const tokenHash = this.tokenService.hashToken(raw)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await this.passwordResetTokens.save(
      this.passwordResetTokens.create({
        id: randomUUID(),
        userId: target.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    )

    // Invalidate every active session so a stolen JWT can't be used between
    // when the admin triggers the reset and when the user picks up the email.
    await this.refreshTokens.update(
      { userId: target.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    )

    const frontend = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200')
    const link = `${frontend}/auth/reset-password?token=${raw}`
    try {
      await this.mailer.sendPasswordResetEmail(target.email, link)
    } catch (err) {
      // Surface the error rather than failing silently — the admin needs to
      // know whether the email actually went out.
      throw new BadRequestException(
        `Failed to send reset email: ${(err as Error)?.message ?? 'unknown error'}`,
      )
    }

    this.auditLog.log({
      organizationId: actor.organizationId ?? null,
      actor: { userId: actor.userId, email: actor.email ?? null, role: actor.role ?? null },
      action: 'admin.user.password_reset_sent',
      resourceType: 'user',
      resourceId: target.id,
      metadata: { email: target.email, expiresAt },
    })

    const devMode = this.config.get<string>('NODE_ENV', 'development') !== 'production'
    return { sentTo: target.email, tokenForDev: devMode ? raw : undefined }
  }
}
