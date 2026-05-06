import type { IRepository } from '@dooform-api-core/domain'

import type { Announcement } from '../entities/announcement.entity'

export interface IAnnouncementRepository extends IRepository<Announcement> {
  /**
   * Returns active announcements visible to the given organization. The returned
   * list includes:
   *  - global announcements (organizationId === null)
   *  - announcements scoped to the matching organization
   *
   * Each returned row has `isActive=true` AND, if startsAt/endsAt are set, the
   * current time is within that window. Most-recently-updated first so the
   * "latest" announcement naturally wins when multiple are active.
   */
  findActiveForOrganization(organizationId: string | null): Promise<Announcement[]>

  findAll(): Promise<Announcement[]>
}
