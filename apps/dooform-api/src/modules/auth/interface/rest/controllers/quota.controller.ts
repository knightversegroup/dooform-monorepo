import { Controller, Get, Post, Body } from '@nestjs/common'

import { CurrentUser, type RequestUser } from '../../../../../common/decorators/current-user.decorator'

import { QuotaService } from '../../../application/services/quota.service'
import { UseQuotaDto } from '../../../application/dtos/quota.dto'

@Controller('auth/quota')
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  async getMyQuota(@CurrentUser() user: RequestUser) {
    return this.quotaService.getMyQuota(user.userId)
  }

  @Get('history')
  async getMyQuotaHistory(@CurrentUser() user: RequestUser) {
    return this.quotaService.getMyQuotaHistory(user.userId)
  }

  @Get('check')
  async checkQuota(@CurrentUser() user: RequestUser) {
    return this.quotaService.checkQuotaDetailed(user.userId, user.roles)
  }

  @Post('use')
  async useQuota(
    @CurrentUser() user: RequestUser,
    @Body() dto: UseQuotaDto,
  ) {
    return this.quotaService.useQuota(user.userId, dto.document_id)
  }

  @Post('refund')
  async refundQuota(
    @CurrentUser() user: RequestUser,
    @Body() dto: UseQuotaDto,
  ) {
    return this.quotaService.refundQuota(user.userId, dto.document_id)
  }
}
