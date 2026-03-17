import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserModel } from '../../infrastructure/persistence/typeorm/models/user.model'
import { RoleModel } from '../../infrastructure/persistence/typeorm/models/role.model'
import { UserRoleModel } from '../../infrastructure/persistence/typeorm/models/user-role.model'
import { RefreshTokenModel } from '../../infrastructure/persistence/typeorm/models/refresh-token.model'
import { UserQuotaModel } from '../../infrastructure/persistence/typeorm/models/user-quota.model'
import { QuotaTransactionModel } from '../../infrastructure/persistence/typeorm/models/quota-transaction.model'
import { QuotaTransactionType, RoleName } from '../../domain/enums/auth.enum'
import type { ListUsersQueryDto, AssignRoleDto, SetQuotaDto, AddQuotaDto } from '../dtos/admin.dto'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
    @InjectRepository(RoleModel)
    private readonly roleRepo: Repository<RoleModel>,
    @InjectRepository(UserRoleModel)
    private readonly userRoleRepo: Repository<UserRoleModel>,
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepo: Repository<RefreshTokenModel>,
    @InjectRepository(UserQuotaModel)
    private readonly quotaRepo: Repository<UserQuotaModel>,
    @InjectRepository(QuotaTransactionModel)
    private readonly transactionRepo: Repository<QuotaTransactionModel>,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100)
    const offset = (page - 1) * limit

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('user.quota', 'quota')

    if (query.search) {
      const pattern = `%${query.search}%`
      qb.where(
        'user.email ILIKE :pattern OR user.display_name ILIKE :pattern OR user.first_name ILIKE :pattern OR user.last_name ILIKE :pattern',
        { pattern },
      )
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(total / limit)

    return {
      users: users.map((u) => this.toUserListItem(u)),
      total,
      page,
      limit,
      total_pages: totalPages,
    }
  }

  async getUser(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role', 'quota'],
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return { user: this.toUserListItem(user) }
  }

  async deleteUser(userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new BadRequestException('Cannot delete your own account')
    }

    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Soft delete
    await this.userRepo.softDelete(userId)

    // Revoke all refresh tokens
    await this.refreshTokenRepo.update({ userId }, { isRevoked: true })

    return { message: 'User deleted successfully' }
  }

  async assignRole(userId: string, dto: AssignRoleDto, adminUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const role = await this.roleRepo.findOne({
      where: { name: dto.role_name, isActive: true },
    })
    if (!role) throw new NotFoundException('Role not found')

    const existing = await this.userRoleRepo.findOne({
      where: { userId, roleId: role.id },
    })
    if (existing) throw new ConflictException('User already has this role')

    const userRole = this.userRoleRepo.create({
      userId,
      roleId: role.id,
      assignedBy: adminUserId,
      assignedAt: new Date(),
    })
    await this.userRoleRepo.save(userRole)

    return { message: 'Role assigned successfully' }
  }

  async removeRole(userId: string, roleId: string, currentUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    // Prevent removing own admin role
    if (userId === currentUserId) {
      const role = await this.roleRepo.findOne({ where: { id: roleId } })
      if (role?.name === RoleName.ADMIN) {
        throw new BadRequestException('Cannot remove your own admin role')
      }
    }

    const result = await this.userRoleRepo.delete({ userId, roleId })
    if (result.affected === 0) {
      throw new NotFoundException('User does not have this role')
    }

    return { message: 'Role removed successfully' }
  }

  async setUserQuota(userId: string, dto: SetQuotaDto, adminUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    let quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) {
      quota = this.quotaRepo.create({ userId, totalQuota: dto.amount, usedQuota: 0 })
      await this.quotaRepo.save(quota)
    } else {
      const oldTotal = quota.totalQuota
      quota.totalQuota = dto.amount
      await this.quotaRepo.save(quota)

      const transaction = this.transactionRepo.create({
        userId,
        transactionType: QuotaTransactionType.SET,
        amount: dto.amount - oldTotal,
        balanceAfter: quota.totalQuota - quota.usedQuota,
        reason: dto.reason ?? null,
        performedBy: adminUserId,
      })
      await this.transactionRepo.save(transaction)
    }

    return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
  }

  async addQuota(userId: string, dto: AddQuotaDto, adminUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    let quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) {
      quota = this.quotaRepo.create({ userId, totalQuota: dto.amount, usedQuota: 0 })
      await this.quotaRepo.save(quota)
    } else {
      quota.totalQuota += dto.amount
      await this.quotaRepo.save(quota)
    }

    const transaction = this.transactionRepo.create({
      userId,
      transactionType: QuotaTransactionType.ADD,
      amount: dto.amount,
      balanceAfter: quota.totalQuota - quota.usedQuota,
      reason: dto.reason ?? null,
      performedBy: adminUserId,
    })
    await this.transactionRepo.save(transaction)

    return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
  }

  async resetQuotaUsage(userId: string, adminUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) throw new NotFoundException('User quota not found')

    const oldUsed = quota.usedQuota
    quota.usedQuota = 0
    await this.quotaRepo.save(quota)

    const transaction = this.transactionRepo.create({
      userId,
      transactionType: QuotaTransactionType.RESET,
      amount: -oldUsed,
      balanceAfter: quota.totalQuota - quota.usedQuota,
      reason: 'Reset usage to 0',
      performedBy: adminUserId,
    })
    await this.transactionRepo.save(transaction)

    return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
  }

  async getQuotaHistory(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    })

    return { transactions }
  }

  async listRoles() {
    const roles = await this.roleRepo.find({ where: { isActive: true } })
    return { roles }
  }

  private toUserListItem(user: UserModel) {
    const roles = (user.userRoles || [])
      .filter((ur) => ur.role?.name && ur.role.isActive)
      .map((ur) => ur.role.name)

    const quota = user.quota
      ? { total: user.quota.totalQuota, used: user.quota.usedQuota, remaining: user.quota.totalQuota - user.quota.usedQuota }
      : null

    return {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      first_name: user.firstName,
      last_name: user.lastName,
      picture_url: user.pictureUrl,
      auth_provider: user.authProvider,
      is_active: user.isActive,
      profile_completed: user.profileCompleted,
      roles,
      quota,
      created_at: user.createdAt,
    }
  }
}
