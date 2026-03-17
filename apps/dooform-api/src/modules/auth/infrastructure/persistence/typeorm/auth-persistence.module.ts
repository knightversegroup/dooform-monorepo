import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModel } from './models/user.model'
import { RoleModel } from './models/role.model'
import { UserRoleModel } from './models/user-role.model'
import { RefreshTokenModel } from './models/refresh-token.model'
import { UserQuotaModel } from './models/user-quota.model'
import { QuotaTransactionModel } from './models/quota-transaction.model'

export const AUTH_ENTITIES = [
  UserModel,
  RoleModel,
  UserRoleModel,
  RefreshTokenModel,
  UserQuotaModel,
  QuotaTransactionModel,
]

@Module({
  imports: [TypeOrmModule.forFeature(AUTH_ENTITIES)],
  exports: [TypeOrmModule],
})
export class AuthPersistenceModule {}
