import { Inject, Injectable, Logger } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import { StorageService } from '../../../../document/application/services/storage.service'

interface DeleteTemplateInput {
  id: string
}

@Injectable()
@UseClassLogger('template')
export class DeleteTemplateUseCase implements UseCase<DeleteTemplateInput, { message: string }> {
  private readonly logger = new Logger(DeleteTemplateUseCase.name)

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    private readonly storageService: StorageService,
  ) {}

  @UseResult()
  async execute(dto: DeleteTemplateInput): Promise<Result<{ message: string }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    }

    // Clean up storage files (non-critical — don't block delete on storage failure)
    const props = template.getProps()
    const filePaths = [props.filePathDocx, props.filePathHtml, props.filePathPdf, props.filePathThumbnail]
    for (const filePath of filePaths) {
      if (filePath) {
        try {
          await this.storageService.deleteFile(filePath)
        } catch (err) {
          this.logger.warn(`Failed to delete storage file ${filePath}: ${err}`)
        }
      }
    }

    await this.templateRepository.deleteById(dto.id)

    return { message: 'Template deleted successfully' } as any
  }
}
