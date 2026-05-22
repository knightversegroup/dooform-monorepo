import { randomUUID } from 'crypto'

import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserModel } from '../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import { OrganizationModel } from '../../../user/infrastructure/persistence/typeorm/models/organization.model'
import { UserRole } from '../../../user/domain/enums/user.enum'
import { UserTier } from '../../../document/domain/enums/document.enum'

import { PasswordService } from '../../infrastructure/services/password.service'
import { PermissionService } from './permission.service'

const FALLBACK_EMAIL = 'admin@dooform.local'
const FALLBACK_PASSWORD = 'DooformAdmin!2026'
const FALLBACK_NAME = 'Global Admin'
const FALLBACK_ORG = 'Dooform'

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name)

  constructor(
    @InjectRepository(UserModel) private readonly users: Repository<UserModel>,
    @InjectRepository(OrganizationModel) private readonly organizations: Repository<OrganizationModel>,
    private readonly password: PasswordService,
    private readonly config: ConfigService,
    private readonly permissions: PermissionService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Run the universal user-assignment backfill first so any existing users
    // (legacy DB, partially-migrated DB, etc.) land in role_assignments
    // without requiring the SQL migration to be applied manually.
    await this.permissions.backfillUserAssignments()

    const existing = await this.users.findOne({ where: { role: UserRole.GLOBAL_ADMIN } })
    if (existing) {
      // Belt-and-suspenders: make sure the existing global admin has the
      // matching role assignment in case they predate the IAM migration.
      await this.permissions.setPrimarySystemRole(existing.id, UserRole.GLOBAL_ADMIN, {
        userId: existing.id,
        role: UserRole.GLOBAL_ADMIN,
      })
      this.logger.log(`GLOBAL_ADMIN already exists: ${existing.email}`)
      return
    }

    const email = (this.config.get<string>('ADMIN_EMAIL') || FALLBACK_EMAIL).toLowerCase().trim()
    const passwordPlain = this.config.get<string>('ADMIN_PASSWORD') || FALLBACK_PASSWORD
    const name = this.config.get<string>('ADMIN_NAME') || FALLBACK_NAME
    const orgName = this.config.get<string>('ADMIN_ORG_NAME') || FALLBACK_ORG

    // If a user already exists with this email but isn't GLOBAL_ADMIN, promote them.
    const byEmail = await this.users.findOne({ where: { email } })
    if (byEmail) {
      byEmail.role = UserRole.GLOBAL_ADMIN
      byEmail.emailVerified = true
      await this.users.save(byEmail)
      await this.permissions.setPrimarySystemRole(byEmail.id, UserRole.GLOBAL_ADMIN, {
        userId: byEmail.id,
        role: UserRole.GLOBAL_ADMIN,
      })
      this.logger.warn(
        `Promoted existing user ${email} to GLOBAL_ADMIN. Password unchanged — use existing credentials.`,
      )
      return
    }

    const slug = await this.uniqueSlug(orgName)
    const org = await this.organizations.save(
      this.organizations.create({
        id: randomUUID(),
        name: orgName,
        slug,
        ownerUserId: null,
      }),
    )

    const passwordHash = await this.password.hash(passwordPlain)
    const user = await this.users.save(
      this.users.create({
        id: randomUUID(),
        email,
        displayName: name,
        avatarUrl: null,
        passwordHash,
        emailVerified: true,
        role: UserRole.GLOBAL_ADMIN,
        userTier: UserTier.ENTERPRISE,
        organizationId: org.id,
        googleId: null,
        onboardedAt: new Date(),
        timezone: null,
        locale: null,
        jobTitle: null,
      }),
    )
    await this.organizations.update({ id: org.id }, { ownerUserId: user.id })

    await this.permissions.setPrimarySystemRole(user.id, UserRole.GLOBAL_ADMIN, {
      userId: user.id,
      role: UserRole.GLOBAL_ADMIN,
      email: user.email,
      organizationId: user.organizationId,
    })

    const usingDefaults =
      !this.config.get<string>('ADMIN_EMAIL') || !this.config.get<string>('ADMIN_PASSWORD')

    this.logger.warn('============================================================')
    this.logger.warn(`Seeded GLOBAL_ADMIN account: ${email}`)
    if (usingDefaults) {
      this.logger.warn(`Default password: ${passwordPlain}`)
      this.logger.warn('CHANGE THIS PASSWORD IMMEDIATELY via /settings/profile or by setting ADMIN_PASSWORD env var.')
    } else {
      this.logger.warn('Password set from ADMIN_PASSWORD env var.')
    }
    this.logger.warn('============================================================')
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
}
