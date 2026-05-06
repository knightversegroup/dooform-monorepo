import { http } from './client';

export interface Announcement {
  id: string;
  message: string;
  linkUrl?: string | null;
  linkText?: string | null;
  organizationId?: string | null;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  message: string;
  linkUrl?: string | null;
  linkText?: string | null;
  organizationId?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

export function listActiveAnnouncements(): Promise<Announcement[]> {
  return http.get<Announcement[]>('/announcements/active');
}

export function listAllAnnouncements(): Promise<Announcement[]> {
  return http.get<Announcement[]>('/admin/announcements');
}

export function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
  return http.post<Announcement>('/admin/announcements', { body: input });
}

export function updateAnnouncement(
  id: string,
  input: UpdateAnnouncementInput,
): Promise<Announcement> {
  return http.put<Announcement>(`/admin/announcements/${id}`, { body: input });
}

export function deleteAnnouncement(id: string): Promise<void> {
  return http.delete<void>(`/admin/announcements/${id}`);
}
