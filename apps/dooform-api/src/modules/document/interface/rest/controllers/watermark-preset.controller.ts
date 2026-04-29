import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
  UseFilters,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { LazyModuleLoader } from '@nestjs/core'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import 'multer'

import { getResultValue } from '@dooform-api-core/shared'
import { LazyBaseController, HttpResultExceptionFilter } from '@dooform-api-core/interface/nestjs'

import type { WatermarkConfig } from '../../../domain/entities/watermark-preset.entity'
import { CreateWatermarkPresetBodyDto, UpdateWatermarkPresetBodyDto } from '../swagger/swagger-dtos'
import { CurrentUser, type UserContext } from '../decorators/user-context.decorator'

@ApiTags('Watermark Presets')
@Controller('v1/watermark-presets')
@UseFilters(HttpResultExceptionFilter)
export class WatermarkPresetController extends LazyBaseController {
  constructor(lazyModuleLoader: LazyModuleLoader) {
    super(lazyModuleLoader)
  }

  @Get()
  @ApiOperation({ summary: 'List watermark presets' })
  async listPresets(@CurrentUser() user: UserContext) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/list-watermark-presets/list-watermark-presets.use-case.module'),
      () => import('../../../application/use-cases/list-watermark-presets/list-watermark-presets.use-case'),
    )
    const result = await uc.execute({ userId: user.userId })
    return getResultValue(result)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get watermark preset by ID' })
  async getPreset(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-watermark-preset/get-watermark-preset.use-case.module'),
      () => import('../../../application/use-cases/get-watermark-preset/get-watermark-preset.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post()
  @ApiOperation({ summary: 'Create a watermark preset' })
  @ApiBody({ type: CreateWatermarkPresetBodyDto })
  async createPreset(
    @Body() body: { name: string; config: WatermarkConfig },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/create-watermark-preset/create-watermark-preset.use-case.module'),
      () => import('../../../application/use-cases/create-watermark-preset/create-watermark-preset.use-case'),
    )
    const result = await uc.execute({
      name: body.name,
      config: body.config,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a watermark preset' })
  @ApiBody({ type: UpdateWatermarkPresetBodyDto })
  async updatePreset(
    @Param('id') id: string,
    @Body() body: { name?: string; config?: WatermarkConfig },
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/update-watermark-preset/update-watermark-preset.use-case.module'),
      () => import('../../../application/use-cases/update-watermark-preset/update-watermark-preset.use-case'),
    )
    const result = await uc.execute({
      id,
      name: body.name,
      config: body.config,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a watermark preset' })
  async deletePreset(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/delete-watermark-preset/delete-watermark-preset.use-case.module'),
      () => import('../../../application/use-cases/delete-watermark-preset/delete-watermark-preset.use-case'),
    )
    const result = await uc.execute({
      id,
      userId: user.userId,
    })
    return getResultValue(result)
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Upload logo for watermark preset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['logo'],
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (PNG or JPEG, max 5MB)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserContext,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/upload-watermark-logo/upload-watermark-logo.use-case.module'),
      () => import('../../../application/use-cases/upload-watermark-logo/upload-watermark-logo.use-case'),
    )
    const result = await uc.execute({
      presetId: id,
      userId: user.userId,
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    })
    return getResultValue(result)
  }

  @Get(':id/logo')
  @ApiOperation({ summary: 'Serve watermark logo image' })
  async getLogo(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Res() res: Response,
  ) {
    const uc = await this.loadUseCase<any>(
      () => import('../../../application/use-cases/get-watermark-preset/get-watermark-preset.use-case.module'),
      () => import('../../../application/use-cases/get-watermark-preset/get-watermark-preset.use-case'),
    )
    const presetResult = await uc.execute({
      id,
      userId: user.userId,
    })
    const preset = getResultValue(presetResult) as { logoPath: string | null }

    if (!preset.logoPath) {
      res.status(404).json({ error: 'No logo uploaded for this preset' })
      return
    }

    // Read logo from storage - need to inject storage service
    // For now, redirect or return the path
    res.set({
      'Cache-Control': 'public, max-age=60',
    })
    res.status(200).json({ logoPath: preset.logoPath })
  }
}
