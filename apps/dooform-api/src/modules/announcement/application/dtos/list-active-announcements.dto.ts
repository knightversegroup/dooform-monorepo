import { Allow } from 'class-validator'

export class ListActiveAnnouncementsDto {
  @Allow()
  organizationId!: string | null
}
