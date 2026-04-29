import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import { GetTemplateByIdDto } from '../../dtos/get-template-by-id.dto'

@Injectable()
@UseClassLogger('template')
export class GetTemplateHtmlPreviewUseCase implements UseCase<GetTemplateByIdDto, { buffer: Buffer; filename: string }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  @UseResult()
  @ValidateInput(GetTemplateByIdDto)
  async execute(dto: GetTemplateByIdDto): Promise<Result<{ buffer: Buffer; filename: string }>> {
    const template = await this.templateRepository.findById(dto.id)
    if (!template) throw new EntityNotFoundException(`Template with id ${dto.id} not found`)
    if (!template.filePathHTML) throw new InvalidOperationException('No HTML preview available')

    const buffer = await this.storageService.read(template.filePathHTML)
    return { buffer, filename: 'preview.html' } as any
  }
}
