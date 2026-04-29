import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, UnauthorizedAccessException, ValidationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { IWatermarkPresetRepository } from '../../../domain/repositories/watermark-preset.repository'
import type { IStorageService } from '../../../domain/services/storage.service'

interface UploadWatermarkLogoInput {
  presetId: string
  userId: string
  file: {
    buffer: Buffer
    originalname: string
    mimetype: string
    size: number
  }
}

interface UploadWatermarkLogoResult {
  id: string
  logoPath: string
}

const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg']

@Injectable()
@UseClassLogger('document')
export class UploadWatermarkLogoUseCase implements UseCase<UploadWatermarkLogoInput, UploadWatermarkLogoResult> {
  constructor(
    @Inject('IWatermarkPresetRepository')
    private readonly presetRepository: IWatermarkPresetRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  @UseResult()
  async execute(dto: UploadWatermarkLogoInput): Promise<Result<UploadWatermarkLogoResult>> {
    if (!dto.file) {
      throw new ValidationException('No file provided')
    }
    if (dto.file.size > MAX_LOGO_SIZE) {
      throw new ValidationException('File size exceeds 5MB limit')
    }
    if (!ALLOWED_MIMETYPES.includes(dto.file.mimetype)) {
      throw new ValidationException('Only PNG and JPEG files are allowed')
    }

    const preset = await this.presetRepository.findById(dto.presetId)
    if (!preset) {
      throw new EntityNotFoundException(`Watermark preset with id ${dto.presetId} not found`)
    }
    if (!preset.isOwnedBy(dto.userId)) {
      throw new UnauthorizedAccessException('You do not have access to this preset')
    }

    // Delete old logo if exists
    if (preset.logoPath) {
      try {
        await this.storageService.delete(preset.logoPath)
      } catch {
        // Non-fatal
      }
    }

    const ext = dto.file.mimetype === 'image/png' ? 'png' : 'jpg'
    const logoPath = `watermark-logos/${dto.userId}/${dto.presetId}/${Date.now()}_logo.${ext}`
    await this.storageService.save(logoPath, dto.file.buffer)

    preset.setLogoPath(logoPath)
    await this.presetRepository.save(preset)

    return {
      id: preset.id,
      logoPath,
    } as any
  }
}
