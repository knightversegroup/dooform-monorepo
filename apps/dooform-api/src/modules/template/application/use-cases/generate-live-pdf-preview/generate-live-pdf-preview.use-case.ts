import { Inject, Injectable } from '@nestjs/common'

import type { UseCase } from '@dooform-api-core/application'
import { EntityNotFoundException, InvalidOperationException } from '@dooform-api-core/domain'
import type { Result } from '@dooform-api-core/shared'
import { UseResult, ValidateInput, UseClassLogger } from '@dooform-api-core/shared/decorators'

import type { ITemplateRepository } from '../../../domain/repositories/template.repository'
import type { IStorageService } from '../../../../document/domain/services/storage.service'
import type { ITemplateProcessorService } from '../../../../document/domain/services/template-processor.service'
import type { IPdfConverterService } from '../../../../document/domain/services/pdf-converter.service'
import { GenerateLivePdfPreviewDto } from '../../dtos/generate-live-pdf-preview.dto'
import { OrgPath } from '../../../../../common/storage/org-path'

@Injectable()
@UseClassLogger('template')
export class GenerateLivePdfPreviewUseCase implements UseCase<GenerateLivePdfPreviewDto, { buffer: Buffer; filename: string }> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepository: ITemplateRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('ITemplateProcessorService')
    private readonly templateProcessor: ITemplateProcessorService,
    @Inject('IPdfConverterService')
    private readonly pdfConverter: IPdfConverterService,
  ) {}

  @UseResult()
  @ValidateInput(GenerateLivePdfPreviewDto)
  async execute(dto: GenerateLivePdfPreviewDto): Promise<Result<{ buffer: Buffer; filename: string }>> {
    const { id, values, callerOrganizationId } = dto

    // 1. Get template from repository
    const template = await this.templateRepository.findById(id)
    if (!template) {
      throw new EntityNotFoundException(`Template with id ${id} not found`)
    }

    // 2. Read DOCX from storage using the stored path, falling back to
    //    org-scoped then legacy paths for pre-multi-tenancy templates.
    let templateBuffer: Buffer
    const organizationId = callerOrganizationId ?? template.organizationId
    const orgDocxPath = organizationId
      ? OrgPath.for(organizationId, 'templates', id, 'template.docx')
      : null
    if (template.filePath && await this.storageService.exists(template.filePath)) {
      templateBuffer = await this.storageService.read(template.filePath)
    } else if (orgDocxPath && await this.storageService.exists(orgDocxPath)) {
      templateBuffer = await this.storageService.read(orgDocxPath)
    } else {
      const legacyPath = `templates/${id}/template.docx`
      templateBuffer = await this.storageService.read(legacyPath)
    }

    // 3. Process template with values (replace placeholders)
    const processedDocx = await this.templateProcessor.processTemplate(templateBuffer, values)

    // 4. Convert to PDF
    const isAvailable = await this.pdfConverter.isAvailable()
    if (!isAvailable) {
      throw new InvalidOperationException('PDF converter service is not available')
    }
    const pdfBuffer = await this.pdfConverter.convertDocxToPdf(processedDocx)

    // 5. Return PDF buffer (no saving - this is preview only)
    return { buffer: pdfBuffer, filename: 'preview.pdf' } as any
  }
}
