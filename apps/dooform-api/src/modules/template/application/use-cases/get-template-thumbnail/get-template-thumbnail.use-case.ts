import { Inject, Injectable, Logger } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { ITemplatePreviewService } from '../../../domain/services/template-preview.service'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class GetTemplateThumbnailUseCase implements UseCase<GetTemplateByIdDto, { buffer: Buffer; filename: string }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('ITemplatePreviewService')
    private readonly previewService: ITemplatePreviewService,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ buffer: Buffer; filename: string }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) throw new EntityNotFoundException(`Template with id ${dto.id} not found`)

    // Lazy backfill: when the small variant is requested but missing, regenerate
    // it from the stored PDF. Existing templates uploaded before the dual-thumbnail
    // pipeline shipped will hit this path on first request and then be cached.
    if (dto.size === 'sm' && !template.filePathThumbnailSm && template.filePathPDF) {
      try {
        const pdfBuffer = await this.storageService.read(template.filePathPDF)
        const smBuffer = await this.previewService.generateThumbnail(pdfBuffer, {
          quality: 'normal',
          width: 480,
        })
        // Derive the small-thumbnail path from a sibling file already saved
        // for this template (PDF or HD thumbnail) — same directory, new name.
        const sibling = template.filePathThumbnail ?? template.filePathPDF
        const smPath = sibling
          ? sibling.replace(/[^/]+$/, 'thumbnail-sm.png')
          : `templates/${template.id}/thumbnail-sm.png`
        await this.storageService.save(smPath, smBuffer)
        template.setFilePathThumbnailSm(smPath)
        await this.templateRepository.save(template)
        return { buffer: smBuffer, filename: 'thumbnail-sm.png' } as any
      } catch (err) {
        new Logger('GetTemplateThumbnailUseCase').warn(
          `Lazy small-thumbnail generation failed for template ${template.id}; falling back to HD: ${(err as Error).message}`,
        )
      }
    }

    // Resolve the requested size with a graceful fallback:
    //   sm  → small variant if present, else HD
    //   hd  → HD if present, else small (rare)
    const sm = template.filePathThumbnailSm
    const hd = template.filePathThumbnail
    const path = dto.size === 'sm' ? sm ?? hd : hd ?? sm

    if (!path) throw new InvalidOperationException('No thumbnail available')

    const buffer = await this.storageService.read(path)
    return { buffer, filename: dto.size === 'sm' ? 'thumbnail-sm.png' : 'thumbnail.png' } as any
  }
}
