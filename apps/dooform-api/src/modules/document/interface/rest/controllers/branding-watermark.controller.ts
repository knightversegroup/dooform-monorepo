import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseFilters,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'

import { getResultValue } from '@dooform-api-core/shared'
import { HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import { GetBrandingWatermarkUseCase } from '../../../application/use-cases/get-branding-watermark/get-branding-watermark.use-case'
import { UpdateBrandingWatermarkUseCase } from '../../../application/use-cases/update-branding-watermark/update-branding-watermark.use-case'
import { DeleteBrandingWatermarkUseCase } from '../../../application/use-cases/delete-branding-watermark/delete-branding-watermark.use-case'
import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import { UpdateBrandingWatermarkBodyDto } from '../swagger/swagger-dtos'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'

@ApiTags('Branding Watermark (Admin)')
@Controller('v1/admin/branding-watermark')
@UseFilters(HttpResultExceptionFilter)
export class BrandingWatermarkController {
  constructor(
    private readonly getBrandingWatermarkUseCase: GetBrandingWatermarkUseCase,
    private readonly updateBrandingWatermarkUseCase: UpdateBrandingWatermarkUseCase,
    private readonly deleteBrandingWatermarkUseCase: DeleteBrandingWatermarkUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get system branding watermark configuration' })
  async getBrandingWatermark() {
    const result = await this.getBrandingWatermarkUseCase.execute({})
    return getResultValue(result)
  }

  @Put()
  @ApiOperation({ summary: 'Update system branding watermark configuration' })
  @ApiBody({ type: UpdateBrandingWatermarkBodyDto })
  async updateBrandingWatermark(
    @Body() body: { config: WatermarkConfig },
    @CurrentUser() user: UserContext,
  ) {
    const result = await this.updateBrandingWatermarkUseCase.execute({
      config: body.config,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Delete()
  @ApiOperation({ summary: 'Reset branding watermark to default' })
  async deleteBrandingWatermark() {
    const result = await this.deleteBrandingWatermarkUseCase.execute({})
    return getResultValue(result)
  }
}
