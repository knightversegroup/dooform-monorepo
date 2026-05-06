import { Column, Entity, Index } from 'typeorm'

import { BaseTypeOrmModel } from '@dooform-api-core/infrastructure/persistence/typeorm'

@Entity('announcements')
@Index(['organizationId', 'isActive'])
@Index(['isActive'])
export class AnnouncementModel extends BaseTypeOrmModel {
  @Column({ type: 'text' })
  message!: string

  @Column({ name: 'link_url', type: 'varchar', length: 2048, nullable: true })
  linkUrl!: string | null

  @Column({ name: 'link_text', type: 'varchar', length: 255, nullable: true })
  linkText!: string | null

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt!: Date | null

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt!: Date | null

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string
}
