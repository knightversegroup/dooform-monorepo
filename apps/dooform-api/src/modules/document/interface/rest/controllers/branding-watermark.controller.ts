import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseFilters,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import { UpdateBrandingWatermarkBodyDto } from '../swagger/swagger-dtos'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'

@ApiTags('Branding Watermark (Admin)')
@Controller('v1/admin/branding-watermark')
@UseFilters(HttpResultExceptionFilter)
export class BrandingWatermarkController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @ApiOperation({ summary: 'Get system branding watermark configuration' })
  async getBrandingWatermark() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-branding-watermark/get-branding-watermark.use-case.module'),
      () => import('../../../application/use-cases/get-branding-watermark/get-branding-watermark.use-case'),
    )
    const result = await uc.execute({})
    return getResultValue(result)
  }

  @Put()
  @ApiOperation({ summary: 'Update system branding watermark configuration' })
  @ApiBody({ type: UpdateBrandingWatermarkBodyDto })
  async updateBrandingWatermark(
    @Body() body: { config: WatermarkConfig },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-branding-watermark/update-branding-watermark.use-case.module'),
      () => import('../../../application/use-cases/update-branding-watermark/update-branding-watermark.use-case'),
    )
    const result = await uc.execute({
      config: body.config,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Delete()
  @ApiOperation({ summary: 'Reset branding watermark to default' })
  async deleteBrandingWatermark() {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-branding-watermark/delete-branding-watermark.use-case.module'),
      () => import('../../../application/use-cases/delete-branding-watermark/delete-branding-watermark.use-case'),
    )
    const result = await uc.execute({})
    return getResultValue(result)
  }
}
