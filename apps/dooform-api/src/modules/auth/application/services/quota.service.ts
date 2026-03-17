import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { IQuotaService } from '../../../../common/guards/quota.guard'
import { UserQuotaModel } from '../../infrastructure/persistence/typeorm/models/user-quota.model'
import { QuotaTransactionModel } from '../../infrastructure/persistence/typeorm/models/quota-transaction.model'
import { QuotaTransactionType } from '../../domain/enums/auth.enum'

@Injectable()
export class QuotaService implements IQuotaService {
  private readonly logger = new Logger(QuotaService.name)

  constructor(
    @InjectRepository(UserQuotaModel)
    private readonly quotaRepo: Repository<UserQuotaModel>,
    @InjectRepository(QuotaTransactionModel)
    private readonly transactionRepo: Repository<QuotaTransactionModel>,
  ) {}

  async getMyQuota(userId: string) {
    const quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) {
      return { total: 0, used: 0, remaining: 0 }
    }
    return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
  }

  async getMyQuotaHistory(userId: string) {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    })
    return { transactions }
  }

  async useQuota(userId: string, documentId: string) {
    return this.quotaRepo.manager.transaction(async (manager) => {
      // Lock row for update
      const quota = await manager
        .createQueryBuilder(UserQuotaModel, 'q')
        .setLock('pessimistic_write')
        .where('q.user_id = :userId', { userId })
        .getOne()

      if (!quota) {
        throw new ForbiddenException('No quota available')
      }

      if (quota.totalQuota - quota.usedQuota <= 0) {
        throw new ForbiddenException('Insufficient quota')
      }

      // Consume quota
      quota.usedQuota++
      quota.lastUsageAt = new Date()
      await manager.save(quota)

      // Record transaction
      const transaction = manager.create(QuotaTransactionModel, {
        userId,
        transactionType: QuotaTransactionType.USE,
        amount: -1,
        balanceAfter: quota.totalQuota - quota.usedQuota,
        documentId,
      })
      await manager.save(transaction)

      return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
    })
  }

  // IQuotaService.checkQuota - simple boolean check for QuotaGuard
  async checkQuota(userId: string): Promise<boolean> {
    const quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) return false
    return (quota.totalQuota - quota.usedQuota) > 0
  }

  // Detailed check for controller endpoint
  async checkQuotaDetailed(userId: string, userRoles?: string[]) {
    if (userRoles?.includes('admin')) {
      return { can_generate: true, is_admin: true }
    }
    const quota = await this.quotaRepo.findOne({ where: { userId } })
    if (!quota) {
      return { can_generate: false, remaining: 0 }
    }
    const remaining = quota.totalQuota - quota.usedQuota
    return { can_generate: remaining > 0, remaining }
  }

  async refundQuota(userId: string, documentId: string) {
    return this.quotaRepo.manager.transaction(async (manager) => {
      const quota = await manager
        .createQueryBuilder(UserQuotaModel, 'q')
        .setLock('pessimistic_write')
        .where('q.user_id = :userId', { userId })
        .getOne()

      if (!quota) {
        throw new NotFoundException('Quota not found')
      }

      if (quota.usedQuota > 0) {
        quota.usedQuota--
      }
      await manager.save(quota)

      const reason = 'Document generation failed'
      const transaction = manager.create(QuotaTransactionModel, {
        userId,
        transactionType: QuotaTransactionType.REFUND,
        amount: 1,
        balanceAfter: quota.totalQuota - quota.usedQuota,
        documentId,
        reason,
      })
      await manager.save(transaction)

      return { total: quota.totalQuota, used: quota.usedQuota, remaining: quota.totalQuota - quota.usedQuota }
    })
  }
}
