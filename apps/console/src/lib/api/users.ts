import { http } from './client';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface CurrentUserDto {
  userId: string;
  userTier: string;
  watermarkDisabled: boolean;
  profile: UserDto | null;
}

export function listUsers() {
  return http.get<{ data: UserDto[] }>('/v1/users');
}

export function createUser(input: {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}) {
  return http.post<UserDto>('/v1/users', { body: input });
}

export function getCurrentUser() {
  return http.get<CurrentUserDto>('/v1/users/me');
}
