import type { IRepository } from '@dooform-api-core/domain'

import type { User } from '../entities/user.entity'

export interface IUserRepository extends IRepository<User> {
  findAll(): Promise<User[]>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
