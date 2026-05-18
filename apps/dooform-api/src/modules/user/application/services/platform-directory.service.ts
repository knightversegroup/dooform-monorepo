import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'

import { UserModel } from '../../../workflow/infrastructure/persistence/typeorm/models/user.model'
import { OrganizationModel } from '../../infrastructure/persistence/typeorm/models/organization.model'

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
@Injectable()
export class PlatformDirectoryService {
  constructor(
    @InjectRepository(UserModel)
    private readonly users: Repository<UserModel>,
    @InjectRepository(OrganizationModel)
    private readonly organizations: Repository<OrganizationModel>,
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
}
